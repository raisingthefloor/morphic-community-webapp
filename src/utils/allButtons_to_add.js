// This file is auto-generated from https://docs.google.com/spreadsheets/d/1F6Ap2czNsMw-KrmRjvgoELh1DzcZaqnHNQvpiUhD3LY.

export const allButtons = {
    adobe_acrobat_reader_dc_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Adobe Acrobat Reader DC",
            exe: "open -a Adobe\\ Acrobat\\ Reader\\ DC",
            exe$win: "AcroRd32",
            color: "blue",
            image_url: "adobeacrobatreaderdc"
        }
    },
    adobe_acrobat_reader_pro_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Adobe Acrobat Reader Pro",
            exe: "open -a Adobe\\ Acrobat",
            exe$win: "Acrobat",
            color: "blue",
            image_url: "adobeacrobatreaderdc"
        }
    },
    app_store_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "App Store",
            exe: "open -a App\\ Store",
            color: "blue",
            image_url: "appstoremac",
            os: "mac"
        }
    },
    books_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Books",
            exe: "open -a Books",
            color: "blue",
            image_url: "booksmac",
            os: "mac"
        }
    },
    calendar_app: {
        kind: "application",
        is_primary: null,
        production: false,
        configuration: {
            subkind: "app",
            label: "Calendar",
            exe: "open -a Calendar",
            exe$win: "outlookcal:",
            color: "blue",
            image_url: "calendar"
        }
    },
    contacts_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Contacts",
            exe: "open -a Contacts",
            exe$win: "ms-people:",
            color: "blue",
            image_url: "contacts"
        }
    },
    "custom-app": {
        kind: "application",
        configuration: {
            subkind: "app",
            label: "Custom Application",
            image_url: "windowmaximize",
            default: "$defaultApp",
            exe: "$exe",
            os: "mac"
        }
    },
    default_mail_app: {
        kind: "link",
        is_primary: true,
        production: false,
        configuration: {
            subkind: "local-email",
            label: "E-mail",
            color: "blue",
            image_url: "mail",
            url: "Default email app on computer",
            description: "Opens the default email app on the computer."
        }
    },
    evernote_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Evernote",
            exe: "open -a Evernote",
            exe$win: "evernote:",
            color: "blue",
            image_url: "evernote"
        }
    },
    facetime_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "FaceTime",
            exe: "open -a FaceTime",
            color: "blue",
            image_url: "facetimemac",
            os: "mac"
        }
    },
    find_my_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Find My",
            exe: "open -a Find\\ My",
            color: "blue",
            os: "mac"
        }
    },
    finder_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Finder",
            exe: "open -a Finder",
            color: "blue",
            image_url: "findermac",
            os: "mac"
        }
    },
    firefox_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Firefox",
            exe: "open -a Firefox",
            exe$win: "firefox",
            color: "blue",
            image_url: "firefox"
        }
    },
    google_chrome_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Google Chrome",
            exe: "open -a Google\\ Chrome",
            exe$win: "chrome",
            color: "blue",
            image_url: "chrome"
        }
    },
    groove_music_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Groove Music",
            exe: "",
            exe$win: "mswindowsmusic:",
            color: "blue",
            image_url: "groovemusic",
            os: "win"
        }
    },
    home_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Home",
            exe: "open -a Home",
            color: "blue",
            os: "mac"
        }
    },
    iina_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "IINA",
            exe: "open -a IINA",
            color: "blue",
            image_url: "iinamac",
            os: "mac"
        }
    },
    imessage_app: {
        kind: "application",
        is_primary: true,
        production: false,
        configuration: {
            subkind: "action",
            label: "Help via iMessage",
            description: "Opens iMessage to get remote help (Mac only)",
            default: "imessage",
            color: "blue"
        }
    },
    itunes_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "iTunes",
            exe: "open -a Music",
            exe$win: "itunes",
            color: "blue",
            image_url: "itunes"
        }
    },
    keynote_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Keynote",
            exe: "open -a Keynote",
            color: "blue",
            os: "mac"
        }
    },
    kindle_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Kindle",
            exe: "open -a Kindle",
            exe$win: "kindle:",
            color: "blue",
            image_url: "kindle"
        }
    },
    local_calendar_app: {
        kind: "application",
        is_primary: true,
        production: false,
        configuration: {
            subkind: "local-calendar",
            label: "Calendar App",
            description: "Opens the local Calendar Application.",
            default: "calendar",
            color: "blue"
        }
    },
    mail_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Mail",
            exe: "open -a Mail",
            exe$win: "outlookmail:",
            color: "blue",
            image_url: "mail"
        }
    },
    maps_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Maps",
            exe: "open -a Maps",
            exe$win: "bingmaps:",
            color: "blue",
            image_url: "maps"
        }
    },
    messages_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Messages",
            exe: "open -a Messages",
            color: "blue",
            image_url: "messagesmac",
            os: "mac"
        }
    },
    messenger_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Messenger",
            exe: "open -a Messenger",
            exe$win: "appx:FACEBOOK.317180B0BB486_8xx8rvfyw5nnt!App",
            color: "blue",
            image_url: "facebookmessenger",
            appx: true
        }
    },
    microsoft_access_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Microsoft Access",
            exe: "open -a Microsoft\\ Access",
            exe$win: "msaccess",
            color: "blue",
            image_url: "msaccess"
        }
    },
    microsoft_excel_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Microsoft Excel",
            exe: "open -a Microsoft\\ Excel",
            exe$win: "excel",
            color: "blue",
            image_url: "msexcel"
        }
    },
    microsoft_onenote_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Microsoft OneNote",
            exe: "open -a Microsoft\\ OneNote",
            exe$win: "appx:Microsoft.Office.OneNote_8wekyb3d8bbwe!microsoft.onenoteim",
            color: "blue",
            image_url: "msonenote",
            appx: true
        }
    },
    microsoft_outlook_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Microsoft Outlook",
            exe: "open -a Microsoft\\ Outlook",
            exe$win: "outlook",
            color: "blue",
            image_url: "msoutlook"
        }
    },
    microsoft_powerpoint_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Microsoft Powerpoint",
            exe: "open -a Microsoft\\ Powerpoint",
            exe$win: "powerpnt",
            color: "blue",
            image_url: "mspowerpoint"
        }
    },
    microsoft_teams_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Microsoft Teams",
            exe: "open -a Microsoft\\ Teams",
            exe$win: "\"%LocalAppData%\\Microsoft\\Teams\\current\\Teams.exe\"",
            color: "blue",
            image_url: "msteams"
        }
    },
    microsoft_to_do_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Microsoft To Do",
            exe: "open -a Microsoft\\ To\\ Do",
            exe$win: "ms-todo:",
            color: "blue",
            image_url: "mstodo"
        }
    },
    microsoft_word_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Microsoft Word",
            exe: "open -a Microsoft\\ Word",
            exe$win: "winword",
            color: "blue",
            image_url: "msword"
        }
    },
    movies_tv_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Movies & TV",
            exe: "",
            exe$win: "mswindowsvideo:",
            color: "blue",
            os: "win"
        }
    },
    neat_office_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Neat Office",
            exe: "",
            exe$win: "appx:15191PeakPlayer.NeatOffice_y5c4dfz5b21fm!App",
            color: "blue",
            os: "win",
            appx: true
        }
    },
    netflix_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Netflix",
            exe: "open - a Netflix",
            exe$win: "appx:4DF9E0F8.Netflix_mcm4njqhnhss8!Netflix.App",
            color: "blue",
            image_url: "netflix",
            appx: true
        }
    },
    new_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "New",
            exe: "open -a News",
            exe$win: "bingnews:",
            color: "blue"
        }
    },
    newton_mail_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Newton Mail",
            exe: "open -a Newton\\ Mail",
            exe$win: "appx:EFEBDD6F.NewtonMail_t7msb53f6zxbm!EFEBDD6F.NewtonMail",
            color: "blue",
            appx: true
        }
    },
    notes_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Notes",
            exe: "open -a Notes",
            color: "blue",
            image_url: "notesmac",
            os: "mac"
        }
    },
    numbers_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Numbers",
            exe: "open -a Numbers",
            color: "blue",
            os: "mac"
        }
    },
    opera_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Opera",
            exe: "open -a Opera",
            exe$win: "opera",
            color: "blue",
            image_url: "opera"
        }
    },
    pages_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Pages",
            exe: "open -a Pages",
            color: "blue",
            os: "mac"
        }
    },
    paint_3d_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Paint 3D",
            exe: "",
            exe$win: "ms-paint:",
            color: "blue",
            os: "win"
        }
    },
    pandora_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Pandora",
            exe: "open -a Pandora",
            exe$win: "appx:PandoraMediaInc.29680B314EFC2_n619g4d5j0fnw!App",
            color: "blue",
            image_url: "pandora",
            appx: true
        }
    },
    photo_booth_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Photo Booth",
            exe: "open -a Photo\\ Booth",
            color: "blue",
            os: "mac"
        }
    },
    photos_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Photos",
            exe: "open -a Photos",
            exe$win: "ms-photos:",
            color: "blue"
        }
    },
    podcasts_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Podcasts",
            exe: "open -a Podcasts",
            color: "blue",
            image_url: "podcastsmac",
            os: "mac"
        }
    },
    preview_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Preview",
            exe: "open -a Preview",
            color: "blue",
            os: "mac"
        }
    },
    quick_assist_app: {
        kind: "application",
        is_primary: true,
        configuration: {
            subkind: "action",
            label: "Quick Assist",
            description: "Opens Quick Assist to get remote help (MS Windows only).",
            default: "quick-assist",
            color: "blue"
        }
    },
    reminders_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Reminders",
            exe: "open -a Reminders",
            color: "blue",
            image_url: "remindersmac",
            os: "mac"
        }
    },
    safari_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Safari",
            exe: "open -a Safari",
            color: "blue",
            os: "mac"
        }
    },
    sketchbook_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "SketchBook",
            exe: "open -a SketchBook",
            exe$win: "appx:89006A2E.AutodeskSketchBook_tf1gferkr813w!App",
            color: "blue",
            appx: true
        }
    },
    slack_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Slack",
            exe: "open -a Slack",
            exe$win: "appx:91750D7E.Slack_8she8kybcnzg4!Slack",
            color: "blue",
            image_url: "slack",
            appx: true
        }
    },
    snip_sketch_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Snip & Sketch",
            exe: "",
            exe$win: "ms-screensketch:",
            color: "blue",
            os: "win"
        }
    },
    spotify_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Spotify",
            exe: "open -a Spotify",
            exe$win: "spotify:",
            color: "blue",
            image_url: "spotify"
        }
    },
    sticky_notes_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Sticky Notes",
            exe: "open -a Stickies",
            exe$win: "appx:Microsoft.MicrosoftStickyNotes_8wekyb3d8bbwe!App",
            color: "blue",
            image_url: "stickynotes",
            appx: true
        }
    },
    stocks_finance_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Stocks & Finance",
            exe: "open -a Stocks",
            exe$win: "bingfinance:",
            color: "blue"
        }
    },
    telegram_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Telegram",
            exe: "open -a Telegram",
            exe$win: "appx:TelegramMessengerLLP.TelegramDesktop_t4vj0pshhgkwm!Telegram.TelegramDesktop.Store",
            color: "blue",
            image_url: "telegram",
            appx: true
        }
    },
    textedit_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "TextEdit",
            exe: "open -a TextEdit",
            color: "blue",
            os: "mac"
        }
    },
    thunderbird_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Thunderbird",
            exe: "open -a Thunderbird",
            exe$win: "thunderbird",
            color: "blue",
            image_url: "thunderbird"
        }
    },
    todoist_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Todoist",
            exe: "open -a Todoist",
            exe$win: "todoist:",
            color: "blue",
            image_url: "todoist"
        }
    },
    tv_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "TV",
            exe: "open -a TV",
            color: "blue",
            image_url: "tvmac",
            os: "mac"
        }
    },
    vlc_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "VLC",
            exe: "open -a VLC",
            exe$win: "appx:VideoLAN.VLC_paz6r1rewnh0a!App",
            color: "blue",
            image_url: "vlc",
            appx: true
        }
    },
    voice_memos_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Voice Memos",
            exe: "open -a Voice\\ Memos",
            color: "blue",
            os: "mac"
        }
    },
    voice_recorder_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Voice Recorder",
            exe: "",
            exe$win: "appx:Microsoft.WindowsSoundRecorder_8wekyb3d8bbwe!App",
            color: "blue",
            os: "win",
            appx: true
        }
    },
    weather_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Weather",
            exe: "",
            exe$win: "bingweather:",
            color: "blue",
            os: "win"
        }
    },
    whatsapp_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Whatsapp",
            exe: "open -a Whatsapp",
            exe$win: "appx:5319275A.WhatsAppDesktop_cv1g1gvanyjgm!WhatsAppDesktop",
            color: "blue",
            image_url: "whatsapp",
            appx: true
        }
    },
    windows_store_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "Windows Store",
            exe: "",
            exe$win: "ms-windows-store:",
            color: "blue",
            image_url: "msstore",
            os: "win"
        }
    },
    wps_office_app: {
        kind: "application",
        is_primary: null,
        configuration: {
            subkind: "app",
            label: "WPS Office",
            exe: "open -a wpsoffice",
            exe$win: "appx:ZhuhaiKingsoftOfficeSoftw.WPSOffice2019_924xes6e8q1tw!WPSOffice2019",
            color: "blue",
            image_url: "wpsoffice",
            appx: true
        }
    },
    zoom_app: {
        kind: "application",
        is_primary: true,
        production: false,
        configuration: {
            subkind: "meeting",
            label: "Zoom",
            description: "Join a Zoom meeting with Zoom Application",
            default: "zoom",
            color: "blue"
        }
    }
};
