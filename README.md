Steps to connect the app directly to GitHub:
1. In Google AI Studio App Build, use the direct GitHub connection option for the generated app.
2. Select or create the approved GitHub repository for the assignment.
3. Confirm that Google AI Studio has pushed the generated app source to GitHub.
4. Open the GitHub repository and verify that package.json, source files, and README are present.
Fallback only: If direct GitHub connection is unavailable, follow the repository setup path:
mkdir weather-assignment
cd weather-assignment
unzip weather-intelligence.zip -d weather-intelligence
cd weather-intelligence

Steps to review the GitHub repository:
Open the connected GitHub repository and confirm these files are present:
package.json
src/ or app source folder
README.md
vite.config.ts or framework configuration, if available
If the GitHub connection does not create the repository or files correctly, reach out to your respective IT Team.

Steps to connect GitHub to Cloudflare Pages:
In Cloudflare, open Workers & Pages and create a new Pages project from the connected GitHub repository.
Select the repository created from Google AI Studio.
Confirm the production branch selected by the facilitator or repository owner.
Set the framework preset or build settings based on the generated project.
For most Google AI Studio Vite apps, use:
Build command: npm run build
Build output directory: dist

Steps to inspect the project settings:
Check that the project has files similar to these:
File or folder	Purpose
src/	React source code
src/App.tsx or src/App.jsx	Main app logic
src/components/	Reusable UI components
package.json	Scripts and dependencies
vite.config.ts or vite.config.js	Vite configuration
README.md	Run and setup instructions


Steps to deploy from Cloudflare Pages:
After connecting the GitHub repository, start the Cloudflare Pages deployment.
Capture the deployment log and verify that the build completes successfully.
Open the generated pages.dev URL.
If deployment fails, review the build log for package install, build command, output directory, or permissions errors.

Do not put API keys, Gemini keys, or secrets into the client-side app or deployment screenshots.
