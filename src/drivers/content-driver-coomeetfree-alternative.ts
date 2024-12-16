import * as utils from "../utils/utils";
import DOMPurify from 'dompurify';

export class CooMeetFreeAlternativeDriver {
    private static instanceRef: CooMeetFreeAlternativeDriver;

    // State
    private country: string = "?";
    private bot = false;
    private policy: string = "?";
    private isFloatingWindowVisible = false;

    private floatingWindow!: HTMLElement;
    private toggleButton!: HTMLElement;

    // Add timestamp property
    private statusTimestamp: number = -1;

    // Add timer property
    private updateTimer: number | null = null;

    private constructor() {
        // Create floating window
        const shadowHost = utils.createElement('div', {
            style: `
                position: fixed;
                top: 50px;
                right: 20px;
                z-index: 2147483647;
                display: none;
            `
        });
        this.floatingWindow = shadowHost;
        const shadow = this.floatingWindow.attachShadow({ mode: 'open' });
        const container = utils.createElement('div', {
            style: `
                background: rgba(27, 30, 30, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                color: white;
                font-size: 14px;
                backdrop-filter: blur(10px);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                width: 200px;
            `
        });

        // Add styles for links in the shadow DOM
        const style = document.createElement('style');
        style.textContent = `
            a {
                color: #1ca5fc;
            }
        `;
        shadow.appendChild(style);

        // Replace github text with actual link
        const desc = chrome.i18n.getMessage("alternative_driver_desc", '<a href="https://github.com/videochat-extension/videochat-extension-freecm/issues" target="_blank">github</a>')
        container.innerHTML = DOMPurify.sanitize(desc, { ADD_ATTR: ['target'], ADD_TAGS: ['a'] });
        shadow.appendChild(container);

        // Create toggle button
        this.toggleButton = utils.createElement('button', {
            innerText: '👁️',
            style: `
                position: fixed;
                top: 10px;
                right: 20px;
                background: #1ca5fc;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            `
        });

        // Add elements to DOM
        document.body.appendChild(this.floatingWindow);
        document.body.appendChild(this.toggleButton);

        // Add event listeners
        this.setupDragging();

        // Start the update timer
        this.startUpdateTimer();
    }

    private setupDragging() {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startButtonTop = 0;
        let startButtonRight = 0;
        let startWindowTop = 0;
        let startWindowRight = 0;
        let hasMoved = false;

        const onMouseDown = (e: MouseEvent) => {
            if (e.target !== this.toggleButton) return;
            e.preventDefault();
            
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            
            const buttonRect = this.toggleButton.getBoundingClientRect();
            const windowRect = this.floatingWindow.getBoundingClientRect();
            
            startButtonTop = parseInt(this.toggleButton.style.top) || buttonRect.top;
            startButtonRight = parseInt(this.toggleButton.style.right) || (window.innerWidth - buttonRect.right);
            startWindowTop = parseInt(this.floatingWindow.style.top) || windowRect.top;
            startWindowRight = parseInt(this.floatingWindow.style.right) || (window.innerWidth - windowRect.right);
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            
            const deltaX = Math.abs(startX - e.clientX);
            const deltaY = Math.abs(startY - e.clientY);
            
            // Check if mouse has moved more than 3 pixels in any direction
            if (deltaX > 3 || deltaY > 3) {
                hasMoved = true;
            }

            const moveX = startX - e.clientX;
            const moveY = startY - e.clientY;

            this.toggleButton.style.top = `${startButtonTop - moveY}px`;
            this.toggleButton.style.right = `${startButtonRight + moveX}px`;
            this.floatingWindow.style.top = `${startWindowTop - moveY}px`;
            this.floatingWindow.style.right = `${startWindowRight + moveX}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        // Handle click separately from drag
        this.toggleButton.addEventListener('click', (e) => {
            if (!hasMoved) {
                this.toggleFloatingWindow();
            }
        });

        document.addEventListener('mousedown', onMouseDown);
    }

    static getInstance(): CooMeetFreeAlternativeDriver {
        if (!CooMeetFreeAlternativeDriver.instanceRef) {
            CooMeetFreeAlternativeDriver.instanceRef = new CooMeetFreeAlternativeDriver();
        }
        return CooMeetFreeAlternativeDriver.instanceRef;
    }

    public start(): boolean {
        this.injectJsonParseListener();
        return true;
    }

    private toggleFloatingWindow() {
        this.isFloatingWindowVisible = !this.isFloatingWindowVisible;
        this.floatingWindow.style.display = this.isFloatingWindowVisible ? 'block' : 'none';
    }

    private updateFloatingWindow() {
        const content = this.floatingWindow.shadowRoot?.querySelector('div') as HTMLElement;
        if (!content) return;

        // Determine the type emoji
        let typeEmoji = '❓'; // Default for unknown
        if (this.policy === 'all') {
            typeEmoji = '🌐'; // Globe emoji representing 'all' connections
        } else if (this.policy === 'relay') {
            typeEmoji = '🔀'; // Shuffle emoji representing 'relay' connections
        }

        let html = `
            <div style="display: flex; flex-direction: column; gap: 8px; padding: 10px; background: #1b1e1e; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.5);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span title="Policy">${typeEmoji}</span>
                    <span title="Status">${this.bot ? '🤖' : '👨'}</span>
                    <span title="Last Human Detected">${this.getLastHumanText()}</span>
                    <span title="Location" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100px;">${DOMPurify.sanitize(this.country)}</span>
                </div>
            </div>
        `;

        content.innerHTML = DOMPurify.sanitize(html);
    }

    private getLastHumanText(): string {
        if (this.statusTimestamp === -1) {
            return "0 s";
        }
        return `${this.getTimeElapsed()}`;
    }

    private getTimeElapsed(): string {
        const now = Date.now();
        const elapsed = now - this.statusTimestamp;
        const seconds = Math.floor(elapsed / 1000);
        
        if (seconds < 60) {
            return `${seconds} s`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    private injectJsonParseListener() {
        window.addEventListener("parsed json", (evt) => {
            let json: any = (<CustomEvent>evt).detail.json;

            try {
                let data = JSON.parse(json);
                if (typeof data === 'object' && data !== null) {
                    const dataObj = data?.data;
                    if (typeof dataObj === 'object' && dataObj !== null) {
                        const countryName = dataObj.countryName;
                        const username = dataObj.username;
                        const cn = dataObj.cn;
                        const country = dataObj.country;
                        const policy = dataObj.policy;

                        if (countryName && username) {
                            const wasBot = this.bot;
                            if (cn) {
                                this.bot = false;
                                this.statusTimestamp = Date.now();
                                this.country = String(countryName);
                            } else {
                                this.bot = true;
                                this.country = String(country);
                            }
                            this.policy = String(policy);
                            this.updateFloatingWindow();
                        }
                    }
                }
            } catch (e) {
                console.error('Alternative driver parse error:', e);
            }
        }, false);
    }

    private startUpdateTimer() {
        // Clear any existing timer
        if (this.updateTimer) {
            window.clearInterval(this.updateTimer);
        }
        
        // Update the window every second
        this.updateTimer = window.setInterval(() => {
            if (this.isFloatingWindowVisible && this.statusTimestamp !== -1) {
                this.updateFloatingWindow();
            }
        }, 1000);
    }

    // Clean up timer when needed
    public destroy() {
        if (this.updateTimer) {
            window.clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
} 