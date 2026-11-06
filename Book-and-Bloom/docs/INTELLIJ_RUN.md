# Run Book & Bloom from IntelliJ

1. Extract the ZIP completely.
2. Choose **File > Open** and select **Book-and-Bloom/pom.xml** inside the extracted folder. Choose **Open as Project**. The folder containing `pom.xml`, `src`, and `target` must be the project root.
3. Let Maven finish importing. Set the Project SDK to **JDK 17 or 21**.
4. Stop any older BookBloomApplication process using the red Stop button.
5. Select **Book and Bloom - Website** from the Run configuration dropdown. This shared configuration includes the provided Tomcat/Jasper dependencies and runs from the project root.
6. Click Run. Wait for `Started BookBloomApplication`.
7. The default browser opens **http://127.0.0.1:8080/** automatically once startup and sample-data initialization finish. Do not append `/**`: that is a route pattern, not a website address.

The Java startup helper also detects ordinary IntelliJ launches through its Java agent. JSP source files are resolved from the Maven module containing the compiled application, so opening a parent folder no longer causes JSP 404 errors. The shared configuration explicitly enables automatic browser opening. Use `--bookbloom.open-browser=false` to disable it for a development run. Normal command-line WAR launches do not automatically open a browser.

## If you use the green arrow beside main()

Open **Run > Edit Configurations**, select `BookBloomApplication`, and set **Working directory** to the full folder containing **pom.xml** and **src/main/webapp**. For a project opened at its Maven root, `$PROJECT_DIR$` is correct. If the setting is hidden, use **Modify options > Working directory**. Restart the application after changing it.

If an outer folder was opened, its name may be `Book-and-Bloom-SE1020` while the actual Maven project is its child `Book-and-Bloom`. Older copies without `IntelliJLaunchSupport.java` return JSP 404 errors when run from that outer folder. The current helper handles that layout; the correct working directory is still recommended so relative data paths remain predictable.

For an Application configuration, include dependencies with **Provided** scope if IntelliJ offers that option. The shared configuration already enables it.

## Existing demo data

`./data` is relative to the working directory. If a previous launch used the outer folder, its data remains in that outer folder. To keep using that data after correcting the working directory, set Program arguments to:

```text
--bookbloom.data-dir="C:/full/path/to/the/outer/folder/data"
```

Do not delete or reset existing data to fix a JSP error.

## Data directory already in use

Run only one Book & Bloom configuration at a time. If **Book and Bloom - Website** is already running, starting `BookBloomApplication` or `start-bookstore.cmd` against the same data folder fails with `This data directory is already in use`. The existing server continues serving the website; the second launch exits.

Open http://127.0.0.1:8080/ first. To restart, select the running website's Run tab, click its red **Stop** button, wait for it to exit, then run that same configuration again. Do not delete `data`, `bookstore.txt`, or `store.lock` to resolve this error. A lock file can exist after normal shutdown; the running process holds the actual operating-system lock.

The shared Run configuration disables parallel instances of itself. A separately generated configuration or a command-line launch can still collide, so use the same configuration consistently.

## Terminal alternative

Open IntelliJ Terminal at the folder containing `pom.xml`:

```powershell
.\start-bookstore.cmd
```

This starts the included WAR from the correct directory. After editing source code, stop it, run `.\mvnw.cmd package`, then start it again. The WAR is rebuilt by Maven; the Java Run configuration builds source through IntelliJ.
