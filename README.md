This is a submission for the [June Solstice Game Jam](https://dev.to/challenges/june-game-jam-2026-06-03)

## What I Built

**Prism Solstice** — a rainbow-powered platformer where you play as Sol, a nonbinary kid on the longest day of the year. The Solstice Beacon has been drained of its light, and its 6 Prisms have been scattered across the land. Collect each prism to unlock new powers (Double Jump, Speed Boost, Super Jump, Glide, and Gem Magnet), then ignite the beacon before the sun sets!

Built entirely in a single HTML file using Canvas 2D.

### Theme Connection

| Theme | How it's represented |
|---|---|
| ☀️ **Solstice** | The sun visibly sets as you play (real-time sky gradient), and the whole goal is to light the beacon before the longest day ends |
| 🏳️‍🌈 **Pride** | Rainbow prisms, gender-neutral protagonist, scarf/hair change colors as you collect, pride flags on title screen |
| ✊🏿 **Juneteenth** | Honored in the victory screen alongside Pride and Solstice celebrations |
| 🎂 **Alan Turing** | Tribute text in the win screen: "In memory of Alan Turing — pioneer, codebreaker, truth." |

### Prize Categories

- **Best Ode to Alan Turing**: The game includes an explicit tribute to Alan Turing in the victory screen. The final beacon sequence represents the light of truth and liberation — themes deeply tied to Turing's legacy as a codebreaker and as a gay man persecuted by the very system he helped protect.

## Demo

https://github.com/user-attachments/assets/your-video-link-here

*(Record and upload a video demo, then paste the link above)*

## Code

https://github.com/yourusername/prism-solstice

*(Or embed your game directly using `{% embed https://your-username.github.io/prism-solstice %}`)*

## How I Built It

**Tech Stack**: HTML5 Canvas, vanilla JavaScript, Web Audio API

The entire game is a single `index.html` file:

- **Physics**: Custom 2D platformer engine with gravity (0.48/frame), variable jump heights, and double-jump mechanics
- **Rendering**: Canvas 2D with gradient skies, parallax clouds, particle systems, and glow effects
- **Audio**: Web Audio API oscillators for procedural sound effects (collect, jump, victory)
- **Level Design**: 10 ground sections with gaps, 9 floating platforms arranged in a progression curve
- **Progression**: Each prism unlocks a permanent power-up in Metroidvania style:
  1. 🔴 Red → Double Jump
  2. 🟠 Orange → Speed Boost
  3. 🟡 Yellow → Super Jump
  4. 🟢 Green → *(cosmetic)*
  5. 🔵 Blue → Glide (slow fall)
  6. 🟣 Purple → Gem Magnet (attract nearby gems)

The sunset timer runs over ~70 seconds of gameplay, pushing the player to keep moving right.

## Additional Resources

Play the game live: [prism-solstice.vercel.app](your-deployed-url)
