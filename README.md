# Stretched Thin: RCTL Activity

A single-page web app for the RCTL planning activity. Groups pick their event, drag the eight karyakars onto the eight departments, handle a curveball, answer the discussion questions, and print or copy a summary.

No build step, no dependencies, no server. Everything is in `index.html`.

## Put it on GitHub Pages

1. Create a new repository on GitHub (public is simplest).
2. Upload `index.html` (and this README) to the root of the repository.
3. Go to **Settings > Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, then save.
5. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.

## Handing it out

- Give each group the direct link for their event, so they skip the picker:
  - Retreat: `https://<your-username>.github.io/<repository-name>/#/retreat`
  - Shibir: `https://<your-username>.github.io/<repository-name>/#/shibir`
  - Samp Camp: `https://<your-username>.github.io/<repository-name>/#/samp`
- A QR code for each link works well on a printed slip.

## How it behaves

- **Saves per device.** Progress is kept in the browser's local storage, so a refresh does not lose anything, but it is not shared between phones. Nothing is sent anywhere.
- **Drag or tap.** Drag a karyakar onto a department (mouse, or touch using the letter circle), or tap a karyakar and then tap a department. The `i` button opens a full profile.
- **Round 1** allows one karyakar per department. **After the curveball**, karyakars can take two jobs.
- **Curveball** is hidden until the group taps "Show the curveball" (it asks to confirm and locks Round 1). If you would rather hand out the curveball on paper, tell groups to wait before opening that tab.
- **Start over** for an event is at the bottom of its Summary tab. To clear everything on a device, clear the site's data in the browser.

## Changing the content

The roster, departments, curveballs, and discussion questions are in the `DATA` object near the bottom of `index.html` (search for `var DATA`). Edit the text there and save.
