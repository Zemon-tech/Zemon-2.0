import React from 'react';
import { Badge } from "@chakra-ui/react";
import { TimelineRoot, TimelineItem, TimelineContent, TimelineConnector } from './timeline';

const getStatusBadge = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge colorScheme="green">completed</Badge>;
    case 'in-progress':
      return <Badge colorScheme="blue">in-progress</Badge>;
    case 'pending':
      return <Badge colorScheme="yellow">pending</Badge>;
    case 'created':
      return <Badge colorScheme="purple">created</Badge>;
    case 'deleted':
      return <Badge colorScheme="red">deleted</Badge>;
    default:
      return <Badge colorScheme="gray">{status}</Badge>;
  }
};

const getTimelineText = (event) => {
  switch (event.status.toLowerCase()) {
    case 'created':
      return (
        <span>
          <span className="font-medium">{event.user_name}</span> created task{' '}
          <span className="font-medium">{event.task_title}</span> {getStatusBadge(event.status)}
        </span>
      );
    case 'deleted':
      return (
        <span>
          <span className="font-medium">{event.user_name}</span> deleted task{' '}
          <span className="font-medium">{event.deletedTaskTitle || event.task_title}</span> {getStatusBadge(event.status)}
        </span>
      );
    default:
      return (
        <span>
          <span className="font-medium">{event.task_title}</span> - {event.user_name} changed status to {getStatusBadge(event.status)}
        </span>
      );
  }
};

const TaskTimeline = ({ events, onError }) => {
  if (!events || events.length === 0) {
    return <div className="text-gray-500">No task history found.</div>;
  }

  try {
    return (
      <TimelineRoot>
        {events.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineConnector />
            <TimelineContent>
              <div className="flex flex-col gap-1">
                <div className="text-sm text-gray-600">
                  {getTimelineText(event)}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
              </div>
            </TimelineContent>
          </TimelineItem>
        ))}
      </TimelineRoot>
    );
  } catch (error) {
    console.error('Error rendering timeline:', error);
    if (onError) {
      onError(error);
    }
    return <div className="text-red-500">Error displaying timeline</div>;
  }
};

export default TaskTimeline; 