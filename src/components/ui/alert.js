import PropTypes from 'prop-types';
import { createElement } from 'react';

/**
 * Alert component for displaying notifications or messages
 */
const Alert = ({ children, variant = 'default', className = '', ...props }) => {
  const variantClasses = {
    default: 'bg-gray-100 border-gray-200 text-gray-800',
    primary: 'bg-blue-100 border-blue-200 text-blue-800',
    success: 'bg-green-100 border-green-200 text-green-800',
    warning: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    destructive: 'bg-red-100 border-red-200 text-red-800',
  };

  const classes = `flex flex-col space-y-2 p-4 border rounded-md ${variantClasses[variant]} ${className}`;

  return createElement(
    'div',
    {
      className: classes,
      role: 'alert',
      ...props,
    },
    children
  );
};

/**
 * AlertTitle component for displaying the title of an alert
 */
const AlertTitle = ({ children, className = '', ...props }) => {
  const classes = `font-medium text-base ${className}`;

  return createElement(
    'h5',
    {
      className: classes,
      ...props,
    },
    children
  );
};

/**
 * AlertDescription component for displaying the description text of an alert
 */
const AlertDescription = ({ children, className = '', ...props }) => {
  const classes = `text-sm ${className}`;

  return createElement(
    'div',
    {
      className: classes,
      ...props,
    },
    children
  );
};

Alert.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'destructive']),
};

AlertTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

AlertDescription.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export { Alert, AlertTitle, AlertDescription };
