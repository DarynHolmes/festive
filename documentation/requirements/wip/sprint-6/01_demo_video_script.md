# Loom video script

Hello. Thank you again for your time last week; I really enjoyed getting to know David and Hugh.

It was clear to me that UGLE values team culture. I appreciate this, it made the role feel like an even stronger fit from my side. 

To strengthen my application and demonstrate my engineering approach, I built a prototype exploring a real problem.

I tackled the following problem:
'Lodge Secretaries need accurate, live dining numbers to manage catering and reduce waste. This replaces paper-based counting with a digital system that works even in historic buildings with poor connectivity.'

(Transition to Screen Share)
[Visual: Show the main dashboard of the app]

I call this The Festive Board Manager.

While a full system would include a member-facing app, I focused my time on the critical piece: the Lodge Secretary’s dashboard. My goal was to implement the complex, 'deep' features mentioned in the job spec—specifically offline-first architecture—so I have descoped authentication for this demo.

[Visual: Click into a specific Lodge to view the dining list]

Here we have the Lodges. The Secretary uses a tablet or phone to manage dining preferences at the venue.

The UI is designed for members aged 18 to 90 — large touch targets and high contrast.


[Visual: Click to change a status]
Changing a status is simple. But under the hood, this uses Server-Sent Events, meaning we have real-time updates.

[Visual: Split screen with two tabs. Change status in Left Tab, watch it update in Right Tab]
Changing the status here instantly updates the other session. This ensures the Secretary always has the latest data, even if a member updates their own status remotely.

[Visual: Open Chrome DevTools -> Network -> Select 'Offline']
Now, let’s look at the most important feature: connectivity. Historic venues often have dead zones. I’m going to simulate a total loss of internet connection.

[Visual: Interact with the app while offline]
You’ll notice the 'Disconnected' badge appears, yet the app remains fully functional. The Secretary can continue to manage dining preferences without interruption.

[Visual: DevTools -> Network -> Select 'Slow 3G']
Now, I’ll restore the connection using a 'Slow 3G' profile to visualize the sync.

[Visual: Watch the requests processing in the Network tab]
You can see the system syncing the queued changes with the backend. The queue syncs sequentially — slower than parallel, but if the connection drops mid-sync, no data is lost.

(Transition to Code Quality/DX)
[Visual: Switch to Histoire interface]
Beyond the app, I wanted to show you my engineering standards.
This is Histoire. I use it to isolate and document components. Because these components are designed to be presentational, they are easy to test and highly reusable.

[Visual: Switch to GitHub Actions Dashboard]
Finally, here is the CI/CD pipeline running via GitHub Actions.
You can see the build passed with zero linting issues or complexity warnings.

[Visual: Switch to Playwright tests report]
I’ve included end-to-end tests using Playwright. 
These mock the backend, which allows me to rigorously test the offline capabilities I just showed you. Every test also runs an axe-core accessibility audit.

I have added a few manual tests to the repo for the cases I could not automate.  

[Visual: Switch to GitHub Actions Dashboard]
I've also included unit tests results on the dashboard which you can expand to see details if you wish.

(Outro: Face to Camera)
The repo has the source code and detailed documentation, including a write-up on how I used AI to assist this build.

Thank you for your time, and I hope to hear from you soon.