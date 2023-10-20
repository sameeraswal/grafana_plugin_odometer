<!-- This README file is going to be the one displayed on the Grafana.com website for your plugin. Uncomment and replace the content here before publishing.

Remove any remaining comments before publishing as these may be displayed on Grafana.com -->
# Odometer

Description:
The Grafana Odometer Plugin is a visualization tool designed to display counters in the form of an odometer. It adds a dynamic and engaging element to your Grafana dashboards, making your data come alive as the numbers change in a manner similar to how digits move in a physical meter.

Features:
This plugin offers two distinct types of animations:

1. Odometer Animation:
With the Odometer animation, your numbers will move gracefully, just like the digits in a traditional mechanical meter. This style of animation brings a touch of elegance and nostalgia to your data visualization.

2. Counter Animation:
The Counter animation, on the other hand, simulates the way numbers change in a digital meter. It offers a modern and sleek representation, making your data feel contemporary and cutting-edge.

Installation:
To install this Grafana Odometer Plugin, follow these steps:

1. Download the plugin zip file from [https://github.com/sameeraswal/grafana_plugin_odometer/raw/v1.0.0/sameeraswal-odometer-panel-1.0.0.zip].
2. Extract the contents to your Grafana plugins directory, which is typically located at 'data/plugins' or '/var/lib/grafana/plugins' on a Unix-based system.
3. Restart your Grafana server to activate the plugin.

Usage:
1. After installation, you can add the Odometer visualization to your Grafana dashboard.

2. Create or edit a panel and select the Odometer visualization from the list of available visualizations.

3. Configure the panel settings, including data sources and queries, to display your desired metrics.

4. Customize the animation type to choose between the Odometer and Counter animations.

5. Save the panel configuration, and the Odometer visualization will display your data with the selected animation style.


<!-- To help maximize the impact of your README and improve usability for users, we propose the following loose structure:

**BEFORE YOU BEGIN**
- Ensure all links are absolute URLs so that they will work when the README is displayed within Grafana and Grafana.com
- Be inspired ✨ 
  - [grafana-polystat-panel](https://github.com/grafana/grafana-polystat-panel)
  - [volkovlabs-variable-panel](https://github.com/volkovlabs/volkovlabs-variable-panel)

**ADD SOME BADGES**

Badges convey useful information at a glance for users whether in the Catalog or viewing the source code. You can use the generator on [Shields.io](https://shields.io/badges/dynamic-json-badge) together with the Grafana.com API 
to create dynamic badges that update automatically when you publish a new version to the marketplace.

- For the logo field use 'grafana'.
- Examples (label: query)
  - Downloads: $.downloads
  - Catalog Version: $.version
  - Grafana Dependency: $.grafanaDependency
  - Signature Type: $.versionSignatureType

Full example: ![Dynamic JSON Badge](https://img.shields.io/badge/dynamic/json?logo=grafana&query=$.version&url=https://grafana.com/api/plugins/grafana-polystat-panel&label=Marketplace&prefix=v&color=F47A20)

Consider other [badges](https://shields.io/badges) as you feel appropriate for your project.

## Overview / Introduction
Provide one or more paragraphs as an introduction to your plugin to help users understand why they should use it.  

Consider including screenshots:
- in [plugin.json](https://grafana.com/docs/grafana/latest/developers/plugins/metadata/#info) include them as relative links.
- in the README ensure they are absolute URLs.

## Requirements
List any requirements or dependencies they may need to run the plugin.

## Getting Started
Provide a quick start on how to configure and use the plugin.

## Documentation
If your project has dedicated documentation available for users, provide links here. For help in following Grafana's style recommendations for technical documentation, refer to our [Writer's Toolkit](https://grafana.com/docs/writers-toolkit/).

## Contributing
Do you want folks to contribute to the plugin or provide feedback through specific means? If so, tell them how!
-->