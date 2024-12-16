import $ from "jquery";
import * as utils from "../utils/utils";

export class CooMeetFreeSimpleDriver {
    private static instanceRef: CooMeetFreeSimpleDriver;

    // Stages: stop = 0 | play = 1
    private stage: 0 | 1 = 0
    private country: string = "?"
    private bot = false
    private humanCheck = -1
    private botHidden = false
    private botMuted = false

    private video: HTMLVideoElement | undefined;

    // Add emoji element property
    private emoji = utils.createElement('p', {
        style: "position: absolute; visibility: hidden; top:50%; left:50%; color:white; transform: translate(-50%, -50%); margin:0; padding:0; user-select: none; font-size: 150%; line-height: 150%",
        innerText: "🤖",
    });

    private constructor() {
    }

    static getInstance(): CooMeetFreeSimpleDriver {
        if (CooMeetFreeSimpleDriver.instanceRef === undefined) {
            CooMeetFreeSimpleDriver.instanceRef = new CooMeetFreeSimpleDriver();
        }

        return CooMeetFreeSimpleDriver.instanceRef;
    }

    public start(element: HTMLElement): boolean {

        this.injectJsonParseListener()
        this.injectInterface()

        let self = this
        const stopButton = this.getStopButton();
        if (stopButton) { 
            stopButton.addEventListener('click', () => {
                this.setNextButtonText(chrome.i18n.getMessage('freecmBotButtonReset'))
                const nextButton = this.getNextButton();
                if (nextButton) {
                    nextButton.style.background = ''
                }
            })
        }

        document.arrive(".free-cm-video-in-stream", {
            existing: true
        }, function (el) {
            self.video = el as HTMLVideoElement;
            
            if (self.video.parentElement) {
                self.video.parentElement.appendChild(self.emoji);
            }

            self.video.addEventListener('play', () => {
                self.stage = 1
                const nextButton = self.getNextButton();
                if (!nextButton) return;

                if (self.bot) {
                    if (self.humanCheck == -1 || self.humanCheck == 0) {
                        self.setNextButtonText(chrome.i18n.getMessage('freecmBotButtonFixAge', [self.country]))
                    } else {
                        self.setNextButtonText(chrome.i18n.getMessage('freecmBotButton', [self.country]))
                    }
                    nextButton.style.background = 'black'
                    if (globalThis.platformSettings.get('muteBots')) {
                        self.muteAudio();
                    }
                } else {
                    self.setNextButtonText(chrome.i18n.getMessage('freecmBotNextButton', [self.country]))
                    nextButton.style.background = 'green'
                    self.unmuteAudio();
                }
                if (self.bot) {
                    self.hideVideo()
                } else {
                    self.showVideo()
                }
            })
        })

        document.leave(".free-cm-video-in-stream", function (el) {
            self.stage = 0
            self.video = undefined
            
            if (self.emoji.parentElement) {
                self.emoji.parentElement.removeChild(self.emoji);
            }
        })

        return true
    }

    private hideVideo() {
        try {
            if (!this.video) return;
            
            if (globalThis.platformSettings.get('hideBots')) {
                if (this.video && 'style' in this.video) {
                    this.video.style.visibility = "hidden";
                    this.botHidden = true;
                    
                    // Always show emoji when video is hidden
                    if (this.emoji && 'style' in this.emoji) {
                        this.emoji.style.visibility = "visible";
                    }
                }
            } else {
                // Make sure video is visible and emoji is hidden when setting is disabled
                this.video.style.visibility = "visible";
                this.botHidden = false;
                this.emoji.style.visibility = "hidden";
            }
        } catch (e) {
            console.warn('Failed to hide video:', e);
        }
    }

    private showVideo() {
        try {
            if (!this.video) return;
            
            if (this.botHidden) {
                if (this.video && 'style' in this.video) {
                    this.video.style.visibility = "visible";
                    this.botHidden = false;
                    
                    // Hide emoji when video is shown
                    if (this.emoji && 'style' in this.emoji) {
                        this.emoji.style.visibility = "hidden";
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to show video:', e);
        }
    }

    private muteAudio() {
        try {
            if (!this.video) return;
            
            if (globalThis.platformSettings.get('muteBots')) {
                if (this.video && 'muted' in this.video) {
                    this.video.muted = true;
                    this.botMuted = true;
                }
            }
        } catch (e) {
            console.warn('Failed to mute audio:', e);
        }
    }

    private unmuteAudio() {
        try {
            if (!this.video) return;
            
            if (this.botMuted) {
                if (this.video && 'muted' in this.video) {
                    this.video.muted = false;
                    this.botMuted = false;
                }
            }
        } catch (e) {
            console.warn('Failed to unmute audio:', e);
        }
    }

    // TODO: fix dry
    public injectInterface() {
        let self = this;

        // Find the user info panel
        const userInfoPanel = document.querySelector('.free-ne-user-info') as HTMLElement;
        if (!userInfoPanel) return;

        // Create extension container
        const extensionContainer = utils.createElement('div', {
            className: 'free-ne-user-info__item free-cm-video-out__panel-item',
            style: 'display: flex; align-items: center; gap: 8px; position: relative;'
        });

        // Create version text with full and short versions
        const versionDisplay = utils.createElement('span', {
            innerText: "Videochat Extension (freecm)",
            style: "color: #1ca5fc; cursor: pointer;",
        });

        $(versionDisplay).on('click', () => {
            window.open('https://github.com/videochat-extension/videochat-extension-freecm/', '_blank');
        });

        // Create settings button with icon (hidden by default)
        const settingsButton = utils.createElement('div', {
            className: 'free-ne-user-info-refresh',
            style: 'cursor: pointer; margin-left: 4px; display: none;'
        });

        settingsButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <rect width="24" height="24" fill="#1ca5fc" rx="2"></rect>
                <path fill="#fff" fill-rule="evenodd" d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM9 12a3 3 0 116 0 3 3 0 01-6 0z" clip-rule="evenodd"/>
                <path fill="#fff" d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6h1.5c0 4.1-3.4 7.5-7.5 7.5S4.5 16.1 4.5 12 7.9 4.5 12 4.5V6z"/>
            </svg>
        `;

        // Settings panel
        const settingsPanel = utils.createElement('div', {
            style: `
                display: none;
                flex-direction: column;
                gap: 8px;
                position: fixed;
                background: #1b1e1e;
                padding: 10px;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                z-index: 9999;
                min-width: 180px;
                background-color: rgb(27, 30, 30);
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                opacity: 1;
                transition: opacity 0.15s ease-in-out;
            `
        });

        // Create settings options
        const createSettingOption = (label: string, id: string, checked: boolean, tooltip: string, onChange: (checked: boolean) => void) => {
            const container = utils.createElement('label', {
                style: `
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    white-space: nowrap;
                    color: #fff;
                    padding: 4px 6px;
                    border-radius: 3px;
                    transition: background-color 0.2s;
                `,
                title: tooltip
            });

            const checkbox = utils.createElement('input', {
                type: 'checkbox',
                id,
                checked,
                style: `
                    cursor: pointer;
                    width: 16px;
                    height: 16px;
                    margin: 0;
                    accent-color: #1ca5fc;
                `
            }) as HTMLInputElement;
            
            // Set initial state
            checkbox.checked = checked;

            // Remove all the custom checkmark code and just use the simple change handler
            checkbox.addEventListener('change', (e: Event) => {
                onChange((e.target as HTMLInputElement).checked);
            });

            const text = utils.createElement('span', {
                innerText: label,
                style: 'font-size: 13px; user-select: none;'
            });

            container.appendChild(checkbox);
            container.appendChild(text);
            return container;
        };

        // Add hide video option
        const hideVideoOption = createSettingOption(
            chrome.i18n.getMessage('freecmSettingHideVideo'),
            'hideVideoCheck',
            globalThis.platformSettings.get('hideBots'),
            chrome.i18n.getMessage('freecmSettingHideVideoTooltip'),
            (checked) => {
                const syncDict = { hideBots: checked };
                globalThis.platformSettings.set(syncDict);
                if (!self.video) return;
                
                if (checked && self.bot) {
                    self.video.style.visibility = "hidden";
                    self.botHidden = true;
                    // Always show emoji when video is hidden
                    self.emoji.style.visibility = "visible";
                } else {
                    self.video.style.visibility = "visible";
                    self.botHidden = false;
                    self.emoji.style.visibility = "hidden";
                }
            }
        );
        settingsPanel.appendChild(hideVideoOption);

        // Add mute option with clearer label
        const muteOption = createSettingOption(
            chrome.i18n.getMessage('freecmSettingMuteBots'),
            'muteBotsCheck',
            globalThis.platformSettings.get('muteBots'),
            chrome.i18n.getMessage('freecmSettingMuteTooltip'),
            (checked) => {
                const syncDict = { muteBots: checked };
                globalThis.platformSettings.set(syncDict);
                if (!self.video) return;
                
                try {
                    if (checked && self.bot) {
                        if (self.video && 'muted' in self.video) {
                            self.video.muted = true;
                            self.botMuted = true;
                        }
                    } else {
                        if (self.video && 'muted' in self.video) {
                            self.video.muted = false;
                            self.botMuted = false;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to set video mute state:', e);
                }
            }
        );
        settingsPanel.appendChild(muteOption);

        // Find the parent panel to monitor hover
        const parentPanel = document.querySelector('.free-ne-user-info.free-cm-video-out__panel');
        if (!parentPanel) return;

        // Show/hide settings icon based on panel hover
        parentPanel.addEventListener('mouseenter', () => {
            settingsButton.style.display = 'block';
        });

        parentPanel.addEventListener('mouseleave', () => {
            versionDisplay.innerText = "Videochat Extension (freecm)";
            settingsButton.style.display = 'none';
            // Also hide settings panel when leaving the main panel
            settingsPanel.style.display = 'none';
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
        });

        // Settings panel hover/click logic
        let closeTimeout: NodeJS.Timeout | null = null;
        let isSettingsPanelVisible = false;

        const showSettingsPanel = () => {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
            
            // Make panel visible but with opacity 0 to calculate dimensions
            settingsPanel.style.display = 'flex';
            settingsPanel.style.opacity = '0';
            
            const buttonRect = settingsButton.getBoundingClientRect();
            settingsPanel.style.left = `${buttonRect.left}px`;
            settingsPanel.style.top = `${buttonRect.top - settingsPanel.offsetHeight - 5}px`;
            
            // Now make it fully visible
            settingsPanel.style.opacity = '1';
            isSettingsPanelVisible = true;
        };

        const hideSettingsPanel = () => {
            closeTimeout = setTimeout(() => {
                settingsPanel.style.display = 'none';
                isSettingsPanelVisible = false;
            }, 300);
        };

        // Handle both hover and click
        settingsButton.addEventListener('mouseenter', showSettingsPanel);
        settingsButton.addEventListener('mouseleave', hideSettingsPanel);
        settingsPanel.addEventListener('mouseenter', showSettingsPanel);
        settingsPanel.addEventListener('mouseleave', hideSettingsPanel);

        // Add click support for touch devices
        settingsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isSettingsPanelVisible) {
                hideSettingsPanel();
            } else {
                showSettingsPanel();
            }
        });

        // Prevent panel from closing when clicking inside it
        settingsPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Close panel when clicking outside
        document.addEventListener('click', () => {
            if (isSettingsPanelVisible) {
                hideSettingsPanel();
            }
        });

        // Assemble the interface
        extensionContainer.appendChild(versionDisplay);
        extensionContainer.appendChild(settingsButton);
        extensionContainer.appendChild(settingsPanel);
        userInfoPanel.appendChild(extensionContainer);
    }

    public injectJsonParseListener = () => {
        window.addEventListener("parsed json", (evt) => {
            let json: any = (<CustomEvent>evt).detail.json

            try {
                let data = JSON.parse(json)
                if (typeof data == "object") {
                    console.log(data)
                    if (data && data.data && data.data.age) {
                        this.humanCheck = data.data.age
                    }
                    if (data && data.data && data.data.countryName && data.data.username) {
                        if (data.data.cn) {
                            this.bot = false
                            this.country = data.data.countryName
                        } else {
                            this.bot = true
                            this.country = data.data.country
                        }
                    }
                    if (data && data.data && data.data.code && data.data.countries) {
                        console.log(`DETECTED AS ${data.data.code}. YOU WILL MEET??? ${data.data.countries.join(', ')}`)
                    }
                }
            } catch (e) {
                // console.dir(e)
            }
        }, false);
    }

    private selectElement(selectors: string[]): HTMLElement | undefined {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element as HTMLElement;
            }
        }
        return undefined;
    }

    private getRemoteVideo(): HTMLVideoElement | undefined {
        const selectors = [
            ".free-cm-video-in-stream",
            ".alternative-video-selector" // Add more selectors as needed
        ];

        const element = this.selectElement(selectors);
        return element instanceof HTMLVideoElement ? element : undefined;
    }

    private getNextButton(): HTMLElement | undefined {
        const selectors = [
            "#cmtNext",
            ".free-ne-control-button",
            "#free-cm > div > div.free-cm-app__container > div > div > section:nth-child(1) > div > div:nth-child(2) > div > div.free-cm-app-chat__sidebar > div > div:nth-child(1) > button"
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element as HTMLElement;
            }
        }
        
        return undefined;
    }

    private setNextButtonText(str: string) {
        const nextButton = this.getNextButton();
        if (!nextButton) return;
        
        if (nextButton.tagName === "INPUT") {
            // @ts-ignore
            nextButton.value = str
        } else {
            nextButton.innerText = str
        }
    }

    private getStopButton(): HTMLElement | undefined {
        const selectors = [
            "#cmtStop",
            ".free-ne-control-button--end",
            "#free-cm > div > div.free-cm-app__container > div > div > section:nth-child(1) > div > div:nth-child(2) > div > div.free-cm-app-chat__sidebar > div > div:nth-child(2) > button"
        ];

        return this.selectElement(selectors);
    }
}