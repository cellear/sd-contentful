interface ErrorMessageProps {
  message: string;
}

/**
 * ErrorMessage component displays a simple error message.
 * 
 * Used for displaying API errors and other failures in a user-friendly way.
 */
export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div style={{ padding: "1rem", color: "#d32f2f", backgroundColor: "#ffebee", borderRadius: "4px" }}>
      <p style={{ margin: 0 }}>Error: {message}</p>
    </div>
  );
}

