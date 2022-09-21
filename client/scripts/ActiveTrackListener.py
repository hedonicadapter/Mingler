from operator import truediv
import sys
from threading import Timer
import requests
import json

SPOTIFY_ACCESS_TOKEN = sys.argv[1]
SPOTIFY_API_METHOD_ENDPOINT= 'https://api.spotify.com/v1/me/player'

def get_current_track(access_token):
    response = requests.get(
        SPOTIFY_API_METHOD_ENDPOINT,
        headers={
            'Authorization': f"Bearer {access_token}"
        }
    )

    if response.status_code == 401:
        send_to_app('401')
        return;
    
    if response.status_code != 204:
        json_response = response.json();

        item = json_response.get("item")

        track_id = item.get("id") if item else None
        track_name = item.get("name") if item else None
        artists = item.get("artists") if item else None
        artists_names = ', '.join([artist.get("name") for artist in artists]) if artists else None

        urls = item.get("external_urls") if item else None
        link = urls.get("spotify") if urls else None


        current_track_info = {
            "id": track_id if track_id else "",
            "name": track_name if track_name else "",
            "artists": artists_names if artists_names else "",
            "link": link if link else "",
            "health":"check"
        }
        
        return current_track_info

def exit_script():
    sys.exit()

t = None
def new_timer():
    global t
    t = Timer(5, exit_script)

def get_from_app():
    boolin = True

    if t:
        if t.is_alive():
            t.cancel()
    
    new_timer()
    t.start()
    
    while boolin:
        line = sys.stdin.readline()
        if line: 
            t.cancel()
            boolin = False

def send_to_app(data):
    print(data)
    sys.stdout.flush()
    get_from_app()

# By Henri Chabert at https://stackoverflow.com/a/55734992/11599993
def utfy_dict(dic):
    if isinstance(dic,str):
        return(str(dic.encode("utf-8"))[2:-1])
    elif isinstance(dic,dict):
        for key in dic:
            dic[key] = utfy_dict(dic[key])
        return(dic)
    elif isinstance(dic,list):
        new_l = []
        for e in dic:
            new_l.append(utfy_dict(e))
        return(new_l)
    else:
        return(dic)
            

def main():
    previous_track_id = None

    def get_track_info():
            nonlocal previous_track_id

            current_track_info = get_current_track(SPOTIFY_ACCESS_TOKEN)
            
            if current_track_info:
                if current_track_info["id"] is None:
                    pass;
                elif previous_track_id != current_track_info["id"]:
                    send_to_app(utfy_dict(current_track_info))

                    previous_track_id = current_track_info["id"]
                
            Timer(1.0, get_track_info).start()
    
    get_track_info()

if __name__ == "__main__":
    main()
