# SpinRush Promo

A marketing campaign project built to demonstrate frontend marketing skills for iGaming.

## Live Demo
https://pavel-levin-desti.github.io/spinrush-promo/

## What's inside

**Landing page** — responsive promo page with A/B tested CTA, email capture form, and UTM tracking integration.

**Email template** — HTML email built with table layout and inline CSS. Dark mode support via @media and [data-ogsc].

**UTM tracking** — utility for building, parsing, and appending UTM parameters to links.

**A/B testing** — lightweight variant assignment with localStorage persistence and analytics payload.

**EmailJS integration** — email capture form sends real welcome emails via EmailJS.

## Tech
Pure HTML, CSS, JavaScript. No frameworks.

## How it works
1. User lands on the page (optionally via UTM link from email)
2. UTM params are captured and merged with A/B test data
3. User submits email → receives welcome bonus email
4. Email contains UTM link back to promo page for conversion tracking
