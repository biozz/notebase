# 2025-05-07 Vendor all dependencies and built frontend files

I like how you can vendor Go dependencies and be sure that your app builds years and multiple version after you stop making changes to it.

The same goes for frontend files, but the reason is that I don't like slow build time inside a container. So I prefer to build local and add built frontend files to the repo. I don't really care about the diffs and forgetting to rebuild the app, because it is usually easy to manage.
