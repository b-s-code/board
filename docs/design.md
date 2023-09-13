# Design

It's a task board with basic features.  What are the defining constraints?

1. It must be possible to serve the application locally.

2. The server must have __zero__ knowledge of the users' data.  This is the primary point of difference from other popular, feature-rich browser based task board applications I have used.

3. The application must provide a persistence mechanism.

Thees criteria are met by avoiding sending users' application data to the server altogether, and giving users responsibility for loading and saving their data, as text files, on their local machine.

The application is constructed as a state machine which works on two collections of parallel arrays and uses some global view state.  That's all it needs to be.

## Data model

The global state is comprised of two objects.

1. Application state: represents the state of the view.  Is pretty minimal.  Does not persist between sessions.

2. Board state: is far richer than the application state. Gets imported/exported as a file containing a serialized JSON object.  This must be done manually by the user.

The board state is modelled as two collections of parallel arrays.  One collection for cards.  One collection for lists.  See `model.ts` for details.

## General flow

Basic flow is:

1. App gets initialized.

2. Main loop runs:

    - User perfoms an action.

    - Action triggers an event.

    - Event handler calls a pure function, which takes in board state and required data, in order to return a board state with user's requested change.

    - Event handler assigns the return value of the pure function to the global board state.

    - Board state now represents what user wants, but the GUI may not.

    - Event handler makes any necessary changes to application state, raises an outdated GUI event then returns.

    - Outdated GUI event handler calls appropriate render function.

    - Render function deletes most stuff from the DOM, reads from app state and board state, draws everything and sets up event handlers to respond to the set of actions that are possible for the user to take next.

3. User quits by just closing the browser tab, saving their data first if desired.
