import os
from dotenv import load_dotenv

load_dotenv()
MUSIC_MAP = {
    "Baroque": [
        "Bach", "Handel", "Vivaldi", "Scarlatti", "Rameau", 
        "Corelli", "Purcell", "Couperin", "Pachelbel", "Telemann"
    ],
    "Classical": [
        "Mozart", "Beethoven", "Haydn", "Gluck", 
        "C.P.E. Bach", "Clementi"
    ],
    "Romantic": [
        "Schubert", "Mendelssohn", "Schumann", "Chopin", "Liszt", 
        "Berlioz", "Brahms", "Tchaikovsky", "Verdi", "Wagner", 
        "Saint-Saëns", "Grieg", "Dvořák", "Mahler"
    ]
}
MUSIC_LINK = "https://www.midiworld.com"
MONGO_URI = os.getenv('MONGO_URI')