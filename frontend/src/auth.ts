import NextAuth,{ type NextAuthOptions } from "next-auth"
import GithubProvider from "next-auth/providers/github"

export const authOptions : NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
    }),
  ],

  callbacks :{
    async jwt ({token, account}){
        if (account){
            token.githubAccessToken = account.access_token
        }

        return token;
    },

    async session ({session}){
        return session;
    }
  }
}

export default NextAuth(authOptions)