import Image from "next/image";

const studentReviews = [
  {
    id: 1,
    reviewText:
      "This app is a game-changer! Knowing exactly when a spot opens up, based on the university's class schedule, has saved me hours of circling. The estimated time feature is incredibly accurate.",
    name: "Marcus Chen",
    description: "CS Student, Senior Year",
    avatar: "/faces/face1.jpg",
  },
  {
    id: 2,
    reviewText:
      "I used to dread finding parking on campus. Now, I just check the timeline before I leave. The real-time availability and projected turnover are brilliant. Worth its weight in gold!",
    name: "Chloe Davies",
    description: "Engineering Student, Sophomore",
    avatar: "/faces/face2.jpg",
  },
  {
    id: 3,
    reviewText:
      "The integration with the timetable is seamless. I love that it predicts the best time to arrive for my 10 AM class based on when the 9 AM classes end. Highly recommend for any commuter!",
    name: "Farid Stevens",
    description: "Business Student, Junior",
    avatar: "/faces/face3.jpg",
  },
];

export const StudentReviews = () => {
  return (
    <section className="text-white py-16 px-4 sm:px-6 lg:px-8 mb-10">
      {/* Grid background (conceptual, you might use a pattern image or actual CSS grid for this) */}
      <div className=" inset-0 bg-grid-pattern opacity-10"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 uppercase tracking-wide">
          Student Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {studentReviews.map((review) => (
            <div
              key={review.id}
              className="bg-zinc-800 rounded-lg shadow-lg p-6 flex flex-col justify-between border border-zinc-700"
            >
              <p className="text-xl font-medium mb-8">
                &ldquo;{review.reviewText}&rdquo;
              </p>
              <div className="flex items-center">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-lg">{review.name}</p>
                  <p className="text-sm text-gray-400">{review.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
