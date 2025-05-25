import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function NotificationsPage() {
  return (
    <div className="container max-w-5xl py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">This month</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 hover:bg-muted rounded-lg">
            <div className="min-w-[4px] self-stretch bg-blue-500 rounded-full"></div>
            <div className="h-12 w-12 rounded bg-green-500 flex items-center justify-center text-white font-bold">
              1N
            </div>
            <div className="flex-1">
              <p>You've been invited to Just In Time Fair - Engineering-Focused on May 9th 2025. Register to attend!</p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">12 days ago</div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-muted rounded-lg">
            <div className="min-w-[4px] self-stretch bg-blue-500 rounded-full"></div>
            <div className="h-12 w-12 rounded bg-green-500 flex items-center justify-center text-white font-bold">
              1N
            </div>
            <div className="flex-1">
              <p>You've been invited to Just In Time Fair - Engineering-Focused on May 9th 2025. Register to attend!</p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">12 days ago</div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-muted rounded-lg">
            <div className="min-w-[4px] self-stretch bg-blue-500 rounded-full"></div>
            <div className="h-12 w-12 rounded bg-green-500 flex items-center justify-center text-white font-bold">
              1N
            </div>
            <div className="flex-1">
              <p>You've been invited to Just In Time Fair - Engineering-Focused on May 9th 2025. Register to attend!</p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">13 days ago</div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-muted rounded-lg">
            <div className="min-w-[4px] self-stretch bg-blue-500 rounded-full"></div>
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg?height=48&width=48&query=state farm logo" alt="State Farm" />
              <AvatarFallback>SF</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p>
                You've been invited to Beyond Your Stripes – State Farm Virtual Military Career Event! on May 6th 2025.
                Register to confirm your spot!
              </p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">13 days ago</div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-muted rounded-lg">
            <div className="min-w-[4px] self-stretch bg-blue-500 rounded-full"></div>
            <div className="h-12 w-12 rounded bg-green-500 flex items-center justify-center text-white font-bold">
              1N
            </div>
            <div className="flex-1">
              <p>You've been invited to Just In Time Fair - Engineering-Focused on May 9th 2025. Register to attend!</p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">14 days ago</div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-muted rounded-lg">
            <div className="min-w-[4px] self-stretch bg-blue-500 rounded-full"></div>
            <div className="h-12 w-12 rounded bg-green-500 flex items-center justify-center text-white font-bold">
              1N
            </div>
            <div className="flex-1">
              <p>You've been invited to Just In Time Fair - Engineering-Focused on May 9th 2025. Register to attend!</p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">17 days ago</div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-muted rounded-lg">
            <div className="min-w-[4px] self-stretch bg-blue-500 rounded-full"></div>
            <div className="h-12 w-12 rounded bg-green-500 flex items-center justify-center text-white font-bold">
              1N
            </div>
            <div className="flex-1">
              <p>You've been invited to Just In Time Fair - Engineering-Focused on May 9th 2025. Register to attend!</p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">18 days ago</div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-muted rounded-lg">
            <div className="min-w-[4px] self-stretch bg-blue-500 rounded-full"></div>
            <div className="h-12 w-12 rounded bg-green-500 flex items-center justify-center text-white font-bold">
              1N
            </div>
            <div className="flex-1">
              <p>You've been invited to Just In Time Fair - Engineering-Focused on May 9th 2025. Register to attend!</p>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">19 days ago</div>
          </div>
        </div>
      </div>
    </div>
  )
}
