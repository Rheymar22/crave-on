<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),  // React
        'http://localhost:5173',                        // React
        'http://localhost:3000',                        // Flutter web default
        'http://localhost:53148',                       // Flutter web random port
        'http://localhost:8080',                        // Flutter web alt port
    ],

    'allowed_origins_patterns' => [
        // Allow any localhost port for Flutter web
        '/^http:\/\/localhost:[0-9]+$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
