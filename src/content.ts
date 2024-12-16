import "./content-globals"
import { PlatformSettings } from "./content-platform";
import { CooMeetFreeSimpleDriver } from "./drivers/content-driver-coomeetfree-simple";
import { CooMeetFreeAlternativeDriver } from "./drivers/content-driver-coomeetfree-alternative";

require('arrive')

async function content() {
    // Initialize platform settings with "coomeet" ID
    globalThis.platformSettings = PlatformSettings.initInstance("coomeet");
    await globalThis.platformSettings.setup()

    // Send message to background script to inject the script
    chrome.runtime.sendMessage({ action: 'injectScript' });

    document.arrive(".free-ne-user-info", { onceOnly: true, existing: true }, async () => {
        // Set defaults
        await globalThis.platformSettings.setDriverDefaults({
            hideBots: false,
            muteBots: false,
        });

        // Initialize and start the driver
        const mainDriver = CooMeetFreeSimpleDriver.getInstance();

        try {
            mainDriver.start(document.body);
        } catch (e) {
            console.warn('Main driver failed:', e);
        }
    });

    const alternativeDriver = CooMeetFreeAlternativeDriver.getInstance();
    // Always start alternative driver as backup
    alternativeDriver.start();
}

// Confirm before executing the content script
const LICENSE_TEXT = `THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`

const userConfirmed = confirm(
    `${chrome.i18n.getMessage('warning_title')}\n\n${chrome.i18n.getMessage('warning_message')}\n\n${LICENSE_TEXT}`
);

if (userConfirmed) {
    content()
}
