# Running the audio recorder and machine learning model

We will use [Anaconda environments](https://conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html) to do this.

## Installing Anaconda
Follow the instructions [here](https://conda.io/projects/conda/en/latest/user-guide/install/index.html) to install miniconda on your laptop/desktop. Ensure you follow the instructions for your operating system.

## Creating the Anaconda environment
The Anaconda environment is defined in the `environment.yml` file.

Make sure you are on the correct git branch by running

    git checkout ml-audio-input

Ensure you are in the correct folder (`/sensing/Audio/src`)

Run the following commands:

    conda env create -f environment.yml
    conda activate tf15

This will create the Anaconda environment, and activate it.

## Running the code
Ensure that before you run the code, you have followed the instructions in `/storage/notes.txt` to run the Docker container to get the database server running. This can be on the same machine or a different one (including a Raspberry Pi).

Run

        python3.7 AutoRecorder.py

When it says `listening`, speak.
Then you will see the machine learning sentiment analysis output in the console, and it will submit the sentiment results to the database.

## Deactivation
To deactivate the Conda environment, run

        conda deactivate

In future, to re-activate the environment, you only need to run

        conda activate tf15
