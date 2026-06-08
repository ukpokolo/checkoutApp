type Props = {
  onClick: () => void;
  isLoading?: boolean;
  amount: string;
};

export default function PayButton({ onClick, isLoading, amount }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full max-w-md mt-6 py-4 px-6 bg-blue-600 hover:bg-blue-700 
      disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-base 
      font-semibold rounded-2xl transition-colors duration-200 flex items-center 
      justify-center gap-2"
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-white border-t-transparent 
          rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <span>🔒</span>
          Pay {amount} securely
        </>
      )}
    </button>
  );
}