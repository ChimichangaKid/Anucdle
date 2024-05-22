# -*- coding: utf-8 -*-
# ==================================================================================================================== #
#
#   File Name: create_snippet.py
#
#   Author: Aidan
#   Description: File to create snippets of random videos from the videos.json file.
#
# ==================================================================================================================== #

# ==================================================================================================================== #
#
#   Imports
#
# ==================================================================================================================== #
import os
import json
import random
import yt_dlp
from moviepy.editor import AudioFileClip

# ==================================================================================================================== #
#
#   Constants and paths
#
# ==================================================================================================================== #
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(SCRIPT_DIR, 'videos.json')
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
DAILY_FOLDER = os.path.join(REPO_ROOT, "app/daily/")
SHORT_CLIP_TIME = 15
LONG_CLIP_TIME = 30
SHORT_CLIP_NAME =  os.path.join(DAILY_FOLDER, "short_clip.mp3")
LONG_CLIP_NAME = os.path.join(DAILY_FOLDER, "long_clip.mp3")
DAILY_INFO = os.path.join(DAILY_FOLDER, "todays_info.json")
OUTPUT_PATH = "temp_audio.mp3"
ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': "temp_audio",
        'postprocessors': [
            {
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            },
            {
                'key': 'FFmpegMetadata',
            },
        ],
    }

# ==================================================================================================================== #
#
#   Classes
#
# ==================================================================================================================== #
class ClipCreator:
    """! The Clip Creator class

    Defines the methods and steps necessary for downloading and shortening audio clips from YouTube.
    """

    def __init__(self, json_path) -> None:
        """! The Clip Creator initializer

        @param json_path: The path to read the json information from as a string.
        """
        self.url, self.info = get_random_video(json_path)
        self.original_path = self.download_as_mp3() 
        self.video_length = convert_to_seconds(self.info["length"])
        self.start_time = self.video_length / 2

    def download_as_mp3(self) -> str:
        """! Downloads videos from YouTube as mp3 files to the root directory.

        @return: The path to the downloaded mp3 file as a string.
        """
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([self.url])
        return OUTPUT_PATH

    def cut_clip_to_size(self, length: int, output_path: str) -> None:
        """! Cuts the corresponding video into the specified length.

        @param length: Integer in seconds representing how long the clip should be.
        @param output_path: String path of the output file.
        """
        audio = AudioFileClip(self.original_path).subclip(self.start_time, self.start_time + length)
        audio.write_audiofile(output_path)

        audio.close()
        return None
    
    def save_information(self) -> None:
        """! Saves the chosen clip information, containing title, url, length and upload date to the corresponding
            json file defined in the init.
        """
        with open(DAILY_INFO, 'w', encoding="utf-8") as f:
            json.dump(self.info, f, ensure_ascii=False, indent=4)

    def delete_temp_file(self) -> None:
        """! Deletes the temporary full video file from YouTube that was saved on the device.
        """
        os.remove(self.original_path)


# ==================================================================================================================== #
#
#   Helper Functions
#
# ==================================================================================================================== #
def get_random_video(json_path: str):
    """! Helper function to load and choose a random dictionary from the json file specified under json_path.

    @param json_path: A path to the json file to randomly select from as a string.
    @return url: The YouTube video url as a string.
    @return video_info[url]: The YouTube video information as a dictionary, containing title, length and upload date.
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        video_info = json.load(f)

    url = random.choice(list(video_info.keys()))
    print(f"The chosen video was {url}.")
    return url, video_info[url]

def convert_to_seconds(time_str) -> int:
    """! Helper function to conver minute:seconds as a string into an integer of just seconds.

    @param time_str: The string of minutes:seconds that will be converted.
    @return The total converted number of seconds.
    """
    minutes, seconds = map(int, time_str.split(':'))
    total_seconds = minutes * 60 + seconds
    return total_seconds


if __name__ == "__main__":
    clipper = ClipCreator(json_path=JSON_PATH)
    clipper.cut_clip_to_size(length=SHORT_CLIP_TIME, output_path=SHORT_CLIP_NAME)
    clipper.cut_clip_to_size(length=LONG_CLIP_TIME, output_path=LONG_CLIP_NAME)
    clipper.save_information()
    clipper.delete_temp_file()
    counter = 100
