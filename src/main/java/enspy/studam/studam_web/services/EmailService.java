package enspy.studam.studam_web.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger LOG = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Async
    public void sendPasswordResetEmail(String to, String name, String token) throws MessagingException {
        if (!mailEnabled) {
            LOG.info("Email disabled; skipping password reset email to {}", to);
            return;
        }
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("resetLink", frontendUrl + "/auth/reset-password?token=" + token);

        String process = templateEngine.process("reset-password-email", context);
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);

        helper.setSubject("Reset Your Password - Studam");
        helper.setText(process, true);
        helper.setTo(to);

        mailSender.send(mimeMessage);
    }

    @Async
    public void sendWelcomeEmail(String to, String name, String username, String password, String role)
            throws MessagingException {
        if (!mailEnabled) {
            LOG.info("Email disabled; skipping welcome email to {}", to);
            return;
        }
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("username", username);
        context.setVariable("password", password);
        context.setVariable("role", role);

        String process = templateEngine.process("welcome-email", context);
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage);

        helper.setSubject("Your Studam Account has been created!");
        helper.setText(process, true);
        helper.setTo(to);

        mailSender.send(mimeMessage);
    }
}
