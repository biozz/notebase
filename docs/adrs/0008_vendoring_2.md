# 2025-05-10 Removing build frontend files from the repo

I am backing down on the idea of vendoring frontend files, because Nuxt generates about 5 MB of chuncked JS and CSS files. This would clutter the repo. Instead I introduce a multistage build of the app image, where the dependencies are installed and frontend files are built and copied to the final image into the pb_public folder.
