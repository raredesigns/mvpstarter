import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <SignIn />
      </div>
  );
  };
  
  export default SignInPage;
  