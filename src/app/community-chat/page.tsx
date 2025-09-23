
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareDashed } from "lucide-react";

export default function CommunityChatPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline mb-2">Community Chat</h1>
          <p className="text-muted-foreground">
            Connect with other patients and providers for support and discussion.
          </p>
        </div>
        <Card className="text-center">
            <CardHeader>
                <div className="mx-auto bg-muted p-4 rounded-full w-fit">
                    <MessageSquareDashed className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardTitle className="pt-4 font-headline">
                    Coming Soon!
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground max-w-md mx-auto">
                    We are working on integrating a secure, real-time chat platform (like Rocket.Chat) to foster a supportive community. This feature will allow for role-based channels and secure messaging.
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
