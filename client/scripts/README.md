1. Run virtual environment
   1.0 open cmd
   1.1 first time:
   1.1.0 pip install virtualenv
   1.1.1 virtualenv venv
   1.2 cd venv; cd Scripts
   1.3 activate.bat

2. Install dependencies
   pip install -r /path/to/requirements.txt
   optional: check dependencies: open new terminal (or exit virtual environment)
   pip install pipreqs
   pipreqs ./<directory where the python scripts are>

3. Test run
   Back in active virtual environment:
   python <script name>.py

4. Create executable
   pip install pyinstaller
   pyinstaller --onefile --icon=<path to logo_48x48.ico> <name of script>.py

5. Delete ./build contents and .spec files in ./

Optional: debug
pip list (you should see three or just a few packages)
where python (make sure the first python.exe is in venv directory)
