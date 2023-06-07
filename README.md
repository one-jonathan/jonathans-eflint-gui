# Jonathan's eFLINT GUI

This is a graphical user interface (GUI) for eFLINT. The fastest way to get started is to use Docker Compose, as it also sets up eFLINT (Haskell) and the EFLINT Server (HTTP Web) for you. Works (for instance) with files located in the main folder of [eflint-examples](https://gitlab.com/eflint/eflint-examples).

### Docker setup:

To set up the GUI using Docker, follow these steps:

- Open a terminal and navigate to the project directory
- Run the following commands:
  - `docker compose build`
  - `docker compose up` or `docker compose up -d` to run in background
- Go to `localhost:3000` in your browser
- Voila! You should see the GUI
- _Docker specific:_ If you want to start an eFLINT instance that for example requires other files, you can do so:
  - Upload all files to the eflint_files folder in this project directory
  - In the GUI, you can access the main file by launching an instance via "Launch Files from Path" and entering `/eflint_files/<mainfile>.eflint` in the Absolute Path input field.

You can also set up the GUI manually:
### Requirements:

- [eFLINT Haskell implementation (eflint-server)](https://gitlab.com/eflint/haskell-implementation) installed
- [EFLINT Server](https://github.com/mostafamohajeri/eflint-server) running on port 8080
  - Install prerequisites to compile and execute the program.
  - Open a terminal and navigate to the `web-server` directory
  - Run `mvn compile && mvn exec:java -Dexec.mainClass="eflint.Main"`
- Node.js

### Setup:

Before proceeding, ensure that the EFLINT Server (port 8080) is up and running.

Next, open a terminal and navigate to the project directory. Then run the following commands:
- `npm install`
- `npm run build`
- `npm run serve`

<small>The proxy server, which is started together with the serve command, is used in order to avoid CORS problems.</small>

### Features:
The GUI provides the following features:

- Status overview of the eFLINT instance
- Creation and termination of facts and transitions
- Backtracking capability
- Phrase execution
- View heads / leaf nodes of instance
- View history or path using a tree view (based on [eFlint-GUI](https://github.com/Ravi-Mohanlal/eFLINT-GUI))
- Facts View
- Killing and creating instances

No support for [Actions & Events](https://gitlab.com/eflint/haskell-implementation#actions-events)

No support for [Queries](https://gitlab.com/eflint/haskell-implementation#queries)

### Development
Follow the same steps as in the setup step, but instead of `npm run build`, run `npm run dev` to start the development server.