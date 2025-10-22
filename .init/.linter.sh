#!/bin/bash
cd /home/kavia/workspace/code-generation/real-time-cloud-dashboard-178878-179000/cloud_dashboard_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

