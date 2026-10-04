# Halloween Metrolink Revenue Protection Prop

This bundle contains the GitHub Pages site for the fictional Halloween costume.

## Files

- `index.html`
- `style.css`
- `script.js`
- `bee-network.jpg`
- `tfgm.png`

The supplied logo dimensions are:
- Bee Network: 1054 × 176 px
- TfGM: 1280 × 320 px

## GitHub Pages setup

1. Create a public GitHub repository named `halloween-tram`.
2. Upload all six files to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Choose branch **main** and folder **/ (root)**.
6. Save and wait for GitHub Pages to publish.

## URLs

Replace `YOURUSERNAME` with your GitHub username.

### Passenger / NFC URL

`https://YOURUSERNAME.github.io/halloween-tram/?ref=MF-7A42K9`

Put this exact URL into the NFC tag.

### Inspector URL

`https://YOURUSERNAME.github.io/halloween-tram/?mode=inspector&ref=MF-7A42K9`

Add this inspector URL to Safari on the iPhone 16 Pro Max and optionally use **Add to Home Screen**.

## Reference number

The reference `MF-7A42K9` is intentionally shared between the NFC passenger page and inspector page.

If you want a different reference, replace `MF-7A42K9` in both URLs.

## Date and time

The site generates the date and time dynamically when the notice/inspection is generated.

Format:
- Date: `DD-MM-YYYY`
- Time: `HH:MM:SS`

The JavaScript explicitly uses the `Europe/London` time zone, so it follows UK GMT/BST rules rather than relying on the phone's displayed time zone.

## Inspector sequence

The inspector sequence is 4.4 seconds long and progresses through:

1. CONTACTLESS DEVICE DETECTED
2. READING TRAVEL CREDENTIAL
3. VERIFYING JOURNEY
4. NO VALID CREDENTIAL FOUND
5. PENALTY FARE ISSUED

The terminal is rotated 180° with CSS so that, when the inspector holds the phone facing the passenger, the display reads upright to the passenger.

## NFC

Program an NTAG213/NTAG215/NTAG216 with the passenger URL above using an NDEF URL record.

Keep the tag rewritable; do not lock it until the costume is tested.

## Important

This is a fictional Halloween prop. It does not collect payment details, process payments, or connect to a real transport authority.
