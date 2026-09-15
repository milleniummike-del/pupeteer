run this flow but ask me for genre and premise

### 1. Sequential Tagging Architecture
The core concept of the generator is a standardized, sequentially lettered tagging system:
- **Actors**: `[Image:Actor-A]`, `[Image:Actor-B]`, `[Image:Actor-C]`...
- **Characters**: `[Image:Character-A]`, `[Image:Character-B]`, `[Image:Character-C]`...
- **Costumes**: `[Image:Costume-A]`, `[Image:Costume-B]`, `[Image:Costume-C]`...
- **Props**: `[Image:Prop-A]`, `[Image:Prop-B]`, `[Image:Prop-C]`...
- **Sets**: `[Image:Set-A]`, `[Image:Set-B]`, `[Image:Set-C]`...

the system automatically assigns the next available uppercase letter.

### 2. Genre & Premise Selection
- **20 Curated Film Genres**: Select from 20 diverse film styles (e.g., Cyberpunk Neo-Noir, Film Noir, Deep Space Opera, Psychological Thriller, Gothic Horror, High Fantasy, Spaghetti Western, Steampunk, Solarpunk, Wuxia, Time Loop Sci-Fi, etc.). Each genre provides aesthetic guidelines, cinematic color cues, and pre-written premise inspirations.
- **Premise Input**: Enter any story concept, conflict, or logline, or click the randomizer to load a genre-tailored premise.
- **Pacing & Shot Count Controls**: Customize the scene length (3 to 8 shots) and narrative tempo (*tense*, *epic*, *deliberate*, *frantic*).

### 3. Scene Synthesis Engine

1. **Asset Generation**: Synthesizes the required actors, costumes, props, and sets with detailed visual descriptions (facial features, fabrics, distress markings, materials, and lighting textures). All Props and Costumes generated should be on a white background with no people. All Sets should be empty with no people. All Actors and Characters should be on a white studio background.  Composes shots adhering strictly to the bracketed tagged prompt format:
   ```
   [Image:Character-A] lifting [Image:Prop-E] from a rock pedestal in [Image:Set-D]
   ```
3. **Staging & Dialogue**: Adds cinematic camera setups (lens millimeter, camera movement), lighting schemes, physical blocking action, character dialogue, and sound design/environmental events.

### 5. Multi-Level JSON Export & Copy System
Everything generated in the application can be exported and copied:
- **Full Scene JSON**: Copy the entire scene document via the top navigation dropdown.
- **Category JSON Arrays**: Dedicated one-click copy buttons for:
  - Copy Items Array - a flat array of Actors, Costumes, Props, Sets
  - Copy Characters Array - A character is a combination of Actor + Costume expressed as"[Image:Actor-X] wearing [Image:Costume-X]" and photographed on a white studio background.
  - Copy Shots Array (`KeyFrameShot[]`)
  - Copy Action & Staging Array (`{ shotNumber, title, action, dialog, events }[]`) all references should have brackets and be expressed as "[Image:...]"
- **Individual JSON Items & Prompts**:
  - **Key Frame Prompt**: Dedicated "Copy Prompt" button on each shot card (`[Image:Character-A] throwing [Image:Prop-A] ...`).
  - **Action & Staging Prompt**: Dedicated "Copy Action" button on each shot card that copies the complete narrative performance prompt, combining:
    - **ACTION & STAGING**: Physical blocking, movement, and character actions
    - **DIALOG**: Spoken character dialogue
    - **EVENTS & AUDIO**: Sound design, audio cues, and environmental events
    *(Individual "Copy" buttons are also available on Dialog and Events & Audio boxes)*.
  - Every single Actor, Character, Costume, Prop, Set, and Shot card features its own "Copy Item JSON" button.
