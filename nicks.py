from miditok import REMI, TokenizerConfig
from miditok.pytorch_data import DatasetMIDI, DataCollator
from miditok.utils import split_files_for_training
from torch.utils.data import DataLoader
from pathlib import Path
from transformers import GPT2LMHeadModel, GPT2Config, get_linear_schedule_with_warmup
import torch
from torch.optim import Adam
from tqdm import tqdm

# Creating a multitrack tokenizer, read the doc to explore all the parameters
config = TokenizerConfig(num_velocities=16, use_chords=True, use_programs=True)
tokenizer = REMI(config)

if not Path("tokens").exists():
    Path("tokens").mkdir()

# Train the tokenizer with Byte Pair Encoding (BPE)
files_paths = list(Path("/Users/nicholasbarsi-rhyne/Projects/classical_music_generator/db").glob("**/*.mid"))
tokenizer.train(vocab_size=30000, files_paths=files_paths)
tokenizer.save(Path("tokens", "tokenizer.json"))


# Split MIDIs into smaller chunks for training
dataset_chunks_dir = Path("tokens", "midi_chunks")
split_files_for_training(
    files_paths=files_paths,
    tokenizer=tokenizer,
    save_dir=dataset_chunks_dir,
    max_seq_len=1024,
)

# Create a Dataset, a DataLoader and a collator to train a model
dataset = DatasetMIDI(
    files_paths=list(dataset_chunks_dir.glob("**/*.mid")),
    tokenizer=tokenizer,
    max_seq_len=1024,
    bos_token_id=tokenizer["BOS_None"],
    eos_token_id=tokenizer["EOS_None"],
)
collator = DataCollator(tokenizer.pad_token_id, copy_inputs_as_labels=True)
dataloader = DataLoader(dataset, batch_size=4, collate_fn=collator)

# Initialize GPT-2 configuration and model
config = GPT2Config(
    vocab_size=30000,  # Match your tokenizer's vocab size
    n_positions=1024,  # Maximum sequence length
    n_ctx=1024,
    n_embd=768,  # Embedding dimension
    n_layer=6,  # Number of transformer layers
    n_head=12,  # Number of attention heads
    pad_token_id=tokenizer.pad_token_id
)

model = GPT2LMHeadModel(config)
model = model.to('cuda' if torch.cuda.is_available() else 'cpu')

# Setup training parameters
learning_rate = 5e-5
epochs = 10
batch_size = 64  # Adjust based on your GPU memory
warmup_steps = 1000

# Initialize optimizer and scheduler
optimizer = Adam(model.parameters(), lr=learning_rate)
scheduler = get_linear_schedule_with_warmup(
    optimizer, 
    num_warmup_steps=warmup_steps,
    num_training_steps=len(dataloader) * epochs
)

# Training loop
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.train()

for epoch in range(epochs):
    total_loss = 0
    progress_bar = tqdm(dataloader, desc=f"Epoch {epoch+1}/{epochs}")
    
    for batch in progress_bar:
        # Get inputs
        inputs = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)
        
        # Forward pass
        outputs = model(
            input_ids=inputs,
            attention_mask=attention_mask,
            labels=labels
        )
        
        loss = outputs.loss
        total_loss += loss.item()
        
        # Update progress bar
        progress_bar.set_postfix({"loss": f"{loss.item():.4f}"})
        
        # Backward pass
        loss.backward()
        optimizer.step()
        scheduler.step()
        optimizer.zero_grad()
    
    avg_loss = total_loss / len(dataloader)
    print(f'Epoch {epoch+1} average loss: {avg_loss:.4f}')

# Save the model
model.save_pretrained('midi_gpt2_model')
tokenizer.save_pretrained('midi_gpt2_model')

def generate_midi(
    model,
    tokenizer,
    prompt=None,
    max_length=1024,
    temperature=0.7,
    num_return_sequences=1,
    top_k=50,
    top_p=0.95
):
    # Set the model to evaluation mode
    model.eval()
    
    # If no prompt is provided, start with the BOS token
    if prompt is None:
        input_ids = torch.tensor([[tokenizer.bos_token_id]]).to(device)
    else:
        # Encode the prompt
        input_ids = tokenizer.encode(prompt, return_tensors='pt').to(device)
    
    # Generate
    with torch.no_grad():
        outputs = model.generate(
            input_ids,
            max_length=max_length,
            temperature=temperature,
            num_return_sequences=num_return_sequences,
            top_k=top_k,
            top_p=top_p,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
            do_sample=True
        )
    
    # Decode and return the generated sequences
    generated_sequences = []
    for sequence in outputs:
        decoded = tokenizer.decode(sequence, skip_special_tokens=True)
        generated_sequences.append(decoded)
    
    return generated_sequences

# Load the saved model and tokenizer
model = GPT2LMHeadModel.from_pretrained('midi_gpt2_model')
model.to(device)

# Generate new music
sequences = generate_midi(
    model,
    tokenizer,
    prompt=None,  # Can provide a starting sequence if desired
    temperature=0.7,  # Adjust for more/less randomness
    num_return_sequences=1
)

# Convert the generated sequence back to MIDI
# Use your existing MIDI conversion code here

