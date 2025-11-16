-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "reservationTime" TEXT NOT NULL,
    "reservationEndTime" TEXT NOT NULL,
    "menuType" TEXT NOT NULL,
    "theme" TEXT,
    "tablePreference" TEXT,
    "specialRequests" TEXT,
    "dietaryRestrictions" TEXT,
    "googleEventId" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantSettings" (
    "id" TEXT NOT NULL,
    "maxGuestsPerSlot" INTEGER NOT NULL DEFAULT 50,
    "slotDuration" INTEGER NOT NULL DEFAULT 120,
    "openingTime" TEXT NOT NULL DEFAULT '12:00',
    "closingTime" TEXT NOT NULL DEFAULT '23:00',
    "daysAdvanceBooking" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "RestaurantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_googleEventId_key" ON "Reservation"("googleEventId");

-- CreateIndex
CREATE INDEX "Reservation_reservationDate_reservationTime_idx" ON "Reservation"("reservationDate", "reservationTime");

-- CreateIndex
CREATE INDEX "Reservation_customerEmail_idx" ON "Reservation"("customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_date_key" ON "BlockedDate"("date");
