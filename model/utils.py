from music21 import note, chord, stream, instrument, duration
import numpy as np
import time
import pickle
def read_pickle(file_path):
    with open(file_path, 'rb') as f:
        return pickle.load(f)

def get_predictions(model, att_model, use_attention=True):
    note_to_int = read_pickle('note_to_int.pkl')
    duration_to_int = read_pickle('duration_to_int.pkl')
    notes_temp=0.9
    duration_temp = 0.9
    max_extra_notes = 210
    max_seq_len = 32
    seq_len = 32

    notes = ['START']
    durations = [0]

    if seq_len is not None:
        notes = ['START'] * (seq_len - len(notes)) + notes
        durations = [0] * (seq_len - len(durations)) + durations

    sequence_length = len(notes)

    prediction_output = []
    notes_input_sequence = []
    durations_input_sequence = []
    overall_preds = []

    for n, d in zip(notes,durations):
        note_int = note_to_int[n]
        duration_int = duration_to_int[d]

        notes_input_sequence.append(note_int)
        durations_input_sequence.append(duration_int)

        prediction_output.append([n, d])

        if n != 'START':
            midi_note = note.Note(n)
            new_note = np.zeros(128)
            new_note[midi_note.pitch.midi] = 1
            overall_preds.append(new_note)

    att_matrix = np.zeros(shape = (max_extra_notes+sequence_length, max_extra_notes))

    for note_index in range(max_extra_notes):

        prediction_input = [
            np.array([notes_input_sequence])
            , np.array([durations_input_sequence])
        ]

        notes_prediction, durations_prediction = model.predict(prediction_input, verbose=0)
        if use_attention:
            att_prediction = att_model.predict(prediction_input, verbose=0)[0]
            att_matrix[(note_index-len(att_prediction)+sequence_length):(note_index+sequence_length), note_index] = att_prediction

        new_note = np.zeros(128)

        for idx, n_i in enumerate(notes_prediction[0]):
            try:
                note_name = int_to_note[idx]
                midi_note = note.Note(note_name)
                new_note[midi_note.pitch.midi] = n_i
            except:
                pass

        overall_preds.append(new_note)

        i1 = sample_with_temp(notes_prediction[0], notes_temp)
        i2 = sample_with_temp(durations_prediction[0], duration_temp)

        note_result = int_to_note[i1]
        duration_result = int_to_duration[i2]

        prediction_output.append([note_result, duration_result])

        notes_input_sequence.append(i1)
        durations_input_sequence.append(i2)

        if len(notes_input_sequence) > max_seq_len:
            notes_input_sequence = notes_input_sequence[1:]
            durations_input_sequence = durations_input_sequence[1:]

        if note_result == 'START':
            break

    overall_preds = np.transpose(np.array(overall_preds))
    print('Generated sequence of {} notes'.format(len(prediction_output)))

    midi_stream = stream.Stream()

    for pattern in prediction_output:
        note_pattern, duration_pattern = pattern
        # pattern is a chord
        if ('.' in note_pattern):
            notes_in_chord = note_pattern.split('.')
            chord_notes = []
            for current_note in notes_in_chord:
                new_note = note.Note(current_note)
                new_note.duration = duration.Duration(duration_pattern)
                new_note.storedInstrument = instrument.Violoncello()
                chord_notes.append(new_note)
            new_chord = chord.Chord(chord_notes)
            midi_stream.append(new_chord)
        elif note_pattern == 'rest':
        # pattern is a rest
            new_note = note.Rest()
            new_note.duration = duration.Duration(duration_pattern)
            new_note.storedInstrument = instrument.Violoncello()
            midi_stream.append(new_note)
        elif note_pattern != 'START':
        # pattern is a note
            new_note = note.Note(note_pattern)
            new_note.duration = duration.Duration(duration_pattern)
            new_note.storedInstrument = instrument.Violoncello()
            midi_stream.append(new_note)

    midi_stream = midi_stream.chordify()
    timestr = time.strftime("%Y%m%d-%H%M%S")
    new_file = 'output-' + timestr + '.mid'
    midi_stream.write('midi', new_file)