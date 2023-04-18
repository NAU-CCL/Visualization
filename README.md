# Getting Started with Visualizer

## Setting Up Visualizer on your local environment

To set up the Visualizer project in your local environment follow the below steps.

- Setup local server to run HTML on local host

    To setup a local server to run HTML on local host you can refer [here](https://semicolon.dev/vscode/how-to-run-html-file-on-localhost-live-server)


## Landing Page

Once you've configured the local host to run the html depending on the setup the html will open on a localhost port and the below page would show up.

![Landing Page](https://drive.google.com/uc?export=view&id=1mOFVy5MJ2hd3n3XpgMjttNSwTQ6w7J4X)

 ### Add More Fields
    By Clicking on the Add More Fields button you can add an extra set of row to input

### Remove
    By Clicking on the Remove button that particular row will be discarded.    


## Visualization

After inputing the values the visualizer will visualize the model based on the state transitions and the rate that was provided.

A Simple example would be an SIR Model.

The SIR Model consitis of the below differential equations.

### Differential Equations
    dS/dt = -β * S * I
    dI/dt = β * S * I - γ * I
    dR/dt = γ * I

The Above differential equations can be translated into a standardized format as below.

### Standardized Format
    y[1] -> y[2], param[1]*y[1]*y[2]

    y[2] -> y[3], param[2]*y[2]

Y[1] is S, Y[2] is I, Y[3] is R
β is param[1]
γ is param[2]

![Visualization Preview](https://drive.google.com/uc?export=view&id=1ZlqZxdPub7IEPRgqkO41SoRGAyvzngxd)


