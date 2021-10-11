# digital-art-sentiment
Tools for capturing, storing, processing, and accessing sentiment events for interactive artwork

## Information Flow

  1. Sensors
     1. Sensors capture raw data
     1. Sentiment events are generated
     1. Sentiment events are sent to the server
  
  1. Storage
     1. Incoming sentiment events are stored in a MySQL database
     1. Information about recent sentiment events can be accessed through GET requests
  
  1. Shaders 
     1. Browser-based shader GETs recent data from the server
     1. Shader renders visualisation

### Flow Diagram

            1. Sensors Team               2. Storage Team         3. Shaders Team
           ─────────────────             ─────────────────       ─────────────────
                      Docker                   Docker
       Sensors      Containers               Container             Visualisation
                                          ┌──────────────┐       ┌───────────────┐
                                          │   Go Server  │       │Browser running│
                                          │MySQL Database│       │Shadertoy      │
                ┌────────────────┐  POST  └──────────────┘  GET  └───────┬───────┘
    Microphone──┤Audio2Sentiment ├───────────►REST API◄──────────────────┘
                └────────────────┘            ▲ ▲ ▲
                                              │ │ │
                ┌────────────────┐  POST      │ │ │
        Camera──┤Vidio2Sentiment ├────────────┘ │ │
                └────────────────┘              │ │
                                                │ │
                ┌────────────────┐  POST        │ │
        Kinect──┤Kinect2Sentiment├──────────────┘ │
                └────────────────┘                │
                                                  │
                ┌────────────────┐  POST          │
        ??????──┤??????2Sentiment├────────────────┘
                └────────────────┘
                
## Portability
To help make code reuseable and quickly deployable, each of the sensor inputs and the server should be encapsulated within docker containers. This structure makes it easy to deploy these containers on a variety of platforms without needing to configure each environment separately.
