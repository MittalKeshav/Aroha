# Aroha - Stay Focused

Aroha is a modern, beautifully designed productivity application built to help you stay in the zone. Designed with a premium, fluid UI, Aroha seamlessly blends task management with deep work mechanics like Pomodoro timers and stopwatches.

## Features

- **Today's Goals:** Organize your daily tasks, set start times, end times, and deadlines. All tasks are visible with native scrolling.
- **Streamlined Focus Sessions:** A distraction-free, perfectly scaled Pomodoro timer and Stopwatch to track your deep work sessions.
- **Progress Sync:** Aroha automatically saves your timer progress every second. If you close the app accidentally, your timer will still be there.
- **Backlog Management:** Easily catch up on overdue tasks from previous days with dedicated "Needs Attention" and "Earlier This Week" sections.
- **Calendar View:** Visualize your productivity history. Review completed tasks, upcoming deadlines, and weekly insights on any given day.
- **Responsive Fluid UI:** A visually stunning, dynamic mesh gradient interface that natively scales to any laptop screen size with smooth, unrestricted scrolling.
- **Desktop Notifications:** Get native popup alerts when your break is over or a task deadline is approaching, configurable in the Settings.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Styling:** Tailwind CSS + Custom CSS Animations
- **Icons:** Material Symbols Outlined
- **State Management:** React Context API

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Workflow

1. Go to the **Today** tab and add your tasks for the day.
2. Switch to the **Focus** tab, select a task, and start the timer.
3. Once your focus session ends, click "Take a Break".
4. Review your long-term progress in the **Calendar** and catch up on missed tasks in the **Backlog**.

## Future Roadmap

- [ ] Firebase Authentication (Google Login, Email/Password)
- [ ] Cloud Database Syncing (Firestore)
- [x] Vercel Deployment
- [x] Advanced Desktop Notifications

## License

This project is licensed under the MIT License.
