<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
       
        $isAnonymous = isset($_POST['is_anonymous']) && $_POST['is_anonymous'] === 'on';
        $userDetails = $isAnonymous ? null : json_decode($_POST['user_details'], true);
        $comment = $_POST['comment'] ?? '';
        
        $adminMailer = new PHPMailer(true);
        $adminMailer->isSMTP();
        $adminMailer->Host = 'mail.techgirlshub.co.za';
        $adminMailer->SMTPAuth = true;
        $adminMailer->Username = 'admin@techgirlshub.co.za';
        $adminMailer->Password = 'Root96void23.';
        $adminMailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $adminMailer->Port = 465;
        
        
        $adminMailer->setFrom('no-reply@techgirlshub.com', 'Team Feedback System');
        $adminMailer->addAddress('admin@techgirlshub.co.za', 'Admin');
        $adminMailer->isHTML(true);
        $adminMailer->Subject = 'New Team Feedback Submission';
        
        
        $adminMailer->Body = "
            <h2>New Feedback Received</h2>
            <p><strong>From:</strong> " . ($isAnonymous ? 'Anonymous' : $userDetails['name']) . "</p>
            <p><strong>Email:</strong> " . ($isAnonymous ? 'Anonymous' : $userDetails['email']) . "</p>
            <p><strong>Feedback:</strong></p>
            <p>{$comment}</p>
        ";
        
        // Handle file attachments
        if (!empty($_FILES['attachments']['name'][0])) {
            foreach ($_FILES['attachments']['tmp_name'] as $key => $tmpName) {
                $fileName = $_FILES['attachments']['name'][$key];
                $adminMailer->addAttachment($tmpName, $fileName);
            }
        }
        
    
        $adminMailer->send();
        
        // Send user confirmation email if not anonymous
        if (!$isAnonymous && isset($userDetails['email'])) {
            $userMailer = new PHPMailer(true);
            $userMailer->isSMTP();
            $userMailer->Host = 'mail.techgirlshub.co.za';
            $userMailer->SMTPAuth = true;
            $userMailer->Username = 'admin@techgirlshub.co.za';
            $userMailer->Password = 'Root96void23.';
            $userMailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $userMailer->Port = 465;
            
            $userMailer->setFrom('no-reply@techgirlshub.com', 'Team Feedback System');
            $userMailer->addAddress($userDetails['email'], $userDetails['name']);
            $userMailer->isHTML(true);
            $userMailer->Subject = 'Feedback Submission Confirmation';
            
            $userMailer->Body = "
                <h2>Thank you for your feedback!</h2>
                <p>Dear {$userDetails['name']},</p>
                <p>We have received your feedback submission. Our team will review it within the next 48 hours.</p>
                <p><strong>Your feedback:</strong></p>
                <p>{$comment}</p>
                <br>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>Team Feedback System</p>
            ";
            
            $userMailer->send();
        }
        
       
        echo json_encode([
            'success' => true,
            'message' => 'Feedback submitted successfully'
        ]);
        
    } catch (Exception $e) {
        error_log("Mail Error: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => "Error sending email: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}
?>
