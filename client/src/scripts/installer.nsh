+!macro customInstall
+  CreateDirectory $LOCALAPPDATA\MINGLER
+  CopyFiles $INSTDIR\resources\scripts $LOCALAPPDATA\MINGLER
+  Delete $INSTDIR\resources\scripts
+!macroend