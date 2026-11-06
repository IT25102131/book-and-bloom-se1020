package lk.bookbloom.web;

import lk.bookbloom.BookBloomApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.context.ServletWebServerApplicationContext;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

import java.awt.Desktop;
import java.lang.management.ManagementFactory;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

/** Makes a source-code launch work even when IntelliJ opened the outer folder. */
@Configuration
public class IntelliJLaunchSupport {
    private static final Logger log = LoggerFactory.getLogger(IntelliJLaunchSupport.class);

    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> sourceJspRoot() {
        return factory -> {
            try {
                URI location = BookBloomApplication.class.getProtectionDomain().getCodeSource().getLocation().toURI();
                if (!"file".equals(location.getScheme())) return;
                Path folder = Path.of(location).toAbsolutePath();
                if (!Files.isDirectory(folder)) return; // Packaged WAR uses its embedded JSPs.
                for (int level = 0; folder != null && level < 6; level++, folder = folder.getParent()) {
                    Path webapp = folder.resolve("src/main/webapp");
                    if (Files.isRegularFile(folder.resolve("pom.xml"))
                            && Files.isRegularFile(webapp.resolve("WEB-INF/views/home.jsp"))) {
                        factory.setDocumentRoot(webapp.toFile());
                        log.info("JSP source directory: {}", webapp);
                        return;
                    }
                }
            } catch (Exception e) {
                log.debug("Using the server's default JSP directory", e);
            }
        };
    }

    @EventListener(ApplicationReadyEvent.class)
    public void openWebsite(ApplicationReadyEvent event) {
        boolean fromIntelliJ = ManagementFactory.getRuntimeMXBean().getInputArguments().stream()
                .anyMatch(argument -> argument.contains("idea_rt.jar"));
        boolean enabled = event.getApplicationContext().getEnvironment()
                .getProperty("bookbloom.open-browser", Boolean.class, fromIntelliJ);
        if (!enabled || !(event.getApplicationContext() instanceof ServletWebServerApplicationContext context)) return;
        try {
            String host = context.getEnvironment().getProperty("server.address", "127.0.0.1");
            if (host.equals("0.0.0.0") || host.equals("::")) host = "127.0.0.1";
            String path = context.getEnvironment().getProperty("server.servlet.context-path", "") + "/";
            URI url = new URI("http", null, host, context.getWebServer().getPort(), path, null, null);
            // ApplicationReadyEvent runs after startup and sample-data initialization.
            log.info("Website ready: {}", url);
            if (System.getProperty("os.name", "").toLowerCase(Locale.ROOT).startsWith("windows")) {
                new ProcessBuilder("rundll32.exe", "url.dll,FileProtocolHandler", url.toString()).start();
            } else if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(url);
            } else {
                log.info("Open the website link above in your browser.");
            }
        } catch (Exception e) {
            // A missing browser must not stop a healthy application.
            log.warn("Automatic browser opening failed; open the website manually: {}", e.getMessage());
        }
    }
}
