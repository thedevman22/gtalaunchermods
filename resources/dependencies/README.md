Place the following files in this folder before shipping or for local development:

- `ScriptHookV.dll` — from [Script Hook V](http://www.dev-c.com/gtav/scripthook/)
- `dinput8.dll` — ASI Loader from [OpenIV / Alexander Blade ASI Loader](https://openiv.com/)

These files are **not** included in the repository due to licensing. The launcher will
copy them into your GTA V root directory when you run the setup checklist.

## Expected layout

```
resources/dependencies/
├── ScriptHookV.dll
├── dinput8.dll
└── README.md
```

After adding the DLLs, restart the launcher. The setup screen will offer to install
them automatically into your GTA V folder.
