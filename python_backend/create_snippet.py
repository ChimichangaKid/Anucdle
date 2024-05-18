# -*- coding: utf-8 -*-
import os
import json
import random
from pytube import YouTube
from moviepy.editor import VideoFileClip

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(SCRIPT_DIR, '..', 'videos.json')
SHORT_CLIP_TIME = 15
LONG_CLIP_TIME = 30
SHORT_CLIP_NAME = "short_clip.mp3"
LONG_CLIP_NAME = "long_clip.mp3"


class ClipCreator:

    def __init__(self, json_path) -> None:
        self.url, self.info = get_random_video(json_path)
        self.original_path = self.download_as_mp3() 
        self.video_length = convert_to_seconds(self.info["length"])
        self.start_time = self.video_length / 2

    def download_as_mp3(self) -> str:
        yt = YouTube(self.url)
        stream = yt.streams.filter(only_audio=True).first()
        temp_path = stream.download(filename='temp_audio.mp3')
        return temp_path

    def cut_clip_to_size(self, length: int, output_path: str) -> None:
        audio = VideoFileClip(self.original_path).audio.subclip(self.start_time, self.start_time + length)
        audio.write_audiofile(output_path)

        audio.close()
        return None
    
    def save_information(self) -> None:
        with open("todays_info.json", 'w', encoding="utf-8") as f:
            json.dump(self.info, f, ensure_ascii=False, indent=4)

    def delete_temp_file(self) -> None:
         os.remove(self.original_path)


def get_random_video(json_path: str):
        with open(json_path, 'r', encoding='utf-8') as f:
            video_info = json.load(f)
        
        url = random.choice(list(video_info.keys()))
        return url, video_info[url]   

def convert_to_seconds(time_str) -> int:
    minutes, seconds = map(int, time_str.split(':'))
    total_seconds = minutes * 60 + seconds
    return total_seconds

if __name__ == "__main__":
    clipper = ClipCreator(json_path=JSON_PATH)
    clipper.cut_clip_to_size(length=SHORT_CLIP_TIME, output_path=SHORT_CLIP_NAME)
    clipper.cut_clip_to_size(length=LONG_CLIP_TIME, output_path=LONG_CLIP_NAME)
    clipper.save_information()
    clipper.delete_temp_file()