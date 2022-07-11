!macro customInstall
  CreateDirectory $LOCALAPPDATA\MINGLER
  CopyFiles $INSTDIR\resources\scripts $LOCALAPPDATA\MINGLER
  Delete $INSTDIR\resources\scripts
  SetRegView 64
  WriteRegStr HKLM "SOFTWARE\Google\Chrome\NativeMessagingHosts\com.samba.minglerhost" "" "$INSTDIR\resources\extension\nativeApps\mingler.json"
!macroend