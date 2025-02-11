<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    // البريد الإلكتروني الذي ستتلقى عليه الرسائل
    $to = "your-email@example.com";
    $subject = "رسالة من موقع HR Hub";

    // محتوى الرسالة
    $message_content = "الاسم: " . $name . "\n";
    $message_content .= "البريد الإلكتروني: " . $email . "\n\n";
    $message_content .= "الرسالة:\n" . $message;

    // إعداد رأس البريد
    $headers = "From: " . $email;

    // إرسال البريد
    if (mail($to, $subject, $message_content, $headers)) {
        echo "تم إرسال الرسالة بنجاح!";
    } else {
        echo "حدث خطأ أثناء إرسال الرسالة.";
    }
}
?>
