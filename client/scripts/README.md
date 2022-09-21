1. Run virtual environment
	1.0 open cmd
	1.1 pip install virtualenv
	1.2 cd Scripts
	1.3 activate.bat
	

2. Install dependencies
	pip install -r /path/to/requirements.txt
	optional: check dependencies: open new terminal (or exit virtual environment)
				      pip install pipreqs
				      pipreqs ./<directory where the python scripts are>

4. Test run
	Back in active virtual environment:
	python <script name>.py

5. Create executable
	pip install pyinstaller
	pyinstaller --onefile --icon=<path to logo_48x48.ico> <name of script>.py

6. Delete ./build contents and .spec files in ./

Optional: debug
	pip list (you should see three or just a few packages)
	where python (make sure the first python.exe is in venv directory)