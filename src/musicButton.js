import { beatPlaying, muteBeat } from './music.js';
import { SONGS, playSong, songLoaded, pauseSong } from './songs.js';

// Little round button (top-right) that turns the music off and back on.
// If nothing was ever playing (e.g. the show was skipped), turning it on starts the first song.

const btn = document.getElementById('music-btn');
let on = false;

function render() {
  btn.classList.toggle('off', !on);
  btn.setAttribute('aria-pressed', String(on));
  btn.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on');
}

btn.addEventListener('click', () => {
  on = !on;
  if (on && !songLoaded() && !beatPlaying()) playSong(SONGS[0]);
  else { pauseSong(!on); muteBeat(!on); }
  render();
});

// show the button; `playing` says whether music is actually on right now
export function showMusicButton(playing = on) {
  on = playing;
  render();
  btn.hidden = false;
}
