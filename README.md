# Board
A task board.

### Building

#### Setting up dev environment

- Have node, npm and typescript compiler installed.
- Run `npm install`.
- Install Browserify `npm install -g browserify`.

#### Actually building

`npm run build`

The built app is located in `build/release/`.

#### Running tests

`npm test`

### Running the app

`$ ./run.sh`
May need to customize to use your browser, or a preferred port.

To kill server afterwards:

- Run `lsof -i :8000`.
- Identify PID of server.
- Kill the relevant process.

