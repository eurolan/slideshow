<?php
header("Content-Type: application/json; charset=utf-8");

// Path where your USB is mounted
$usbPath = '/var/media/usb1/';
$urlBase = ''; // If behind a web-accessible alias, e.g. '/usb/'

// scan for jpg/png
$images = [];
foreach (glob($usbPath . "*.{jpg,jpeg,png,gif}", GLOB_BRACE) as $file) {
    $images[] = $urlBase . basename($file);
}

echo json_encode([
    "images"      => $images,
    "count"       => count($images),
    "timestamp"   => time()
]);
