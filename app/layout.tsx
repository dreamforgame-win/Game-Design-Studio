import type {Metadata} from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const _error = console.error;
              console.error = (...args) => {
                if (typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
                  return;
                }
                _error(...args);
              };
              window.addEventListener('error', function(e) {
                if (e.message.includes('ResizeObserver')) {
                  e.stopImmediatePropagation();
                }
              });
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
