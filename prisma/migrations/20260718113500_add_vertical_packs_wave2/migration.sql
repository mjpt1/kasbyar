-- AlterEnum: add wave-2 IndustryPack values (Postgres ADD VALUE; commit before use in same txn on older PG)
ALTER TYPE IndustryPack ADD VALUE 'BEAUTY_SALON';
ALTER TYPE IndustryPack ADD VALUE 'FOOD_SERVICE';
ALTER TYPE IndustryPack ADD VALUE 'EDUCATION';
ALTER TYPE IndustryPack ADD VALUE 'FITNESS';
ALTER TYPE IndustryPack ADD VALUE 'REAL_ESTATE';
ALTER TYPE IndustryPack ADD VALUE 'WORKSHOP';

-- CreateEnum
CREATE TYPE ServiceBookingStatus AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE FoodOrderStatus AS ENUM ('OPEN', 'PREPARING', 'READY', 'SERVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE EnrollmentStatus AS ENUM ('INTERESTED', 'ENROLLED', 'ACTIVE', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE MembershipStatus AS ENUM ('ACTIVE', 'EXPIRED', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE ListingStatus AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE RepairJobStatus AS ENUM ('INTAKE', 'DIAGNOSING', 'WAITING_PARTS', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE BeautyAppointment (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    stylistName TEXT,
    serviceName TEXT NOT NULL,
    status ServiceBookingStatus NOT NULL DEFAULT 'SCHEDULED',
    scheduledAt TIMESTAMP(3) NOT NULL,
    durationMin INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(18,0),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT BeautyAppointment_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE MenuItem (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    price DECIMAL(18,0) NOT NULL,
    isAvailable BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT MenuItem_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE FoodOrder (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT,
    tableLabel TEXT,
    status FoodOrderStatus NOT NULL DEFAULT 'OPEN',
    totalAmount DECIMAL(18,0) NOT NULL,
    itemsSummary TEXT,
    orderedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT FoodOrder_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE Course (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    title TEXT NOT NULL,
    instructor TEXT,
    capacity INTEGER NOT NULL DEFAULT 20,
    price DECIMAL(18,0),
    startDate TIMESTAMP(3),
    endDate TIMESTAMP(3),
    isActive BOOLEAN NOT NULL DEFAULT true,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT Course_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE CourseEnrollment (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    courseId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    status EnrollmentStatus NOT NULL DEFAULT 'ENROLLED',
    enrolledAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT CourseEnrollment_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE GymMembership (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    planName TEXT NOT NULL,
    status MembershipStatus NOT NULL DEFAULT 'ACTIVE',
    startsAt TIMESTAMP(3) NOT NULL,
    endsAt TIMESTAMP(3) NOT NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT GymMembership_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE GymClass (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    title TEXT NOT NULL,
    coach TEXT,
    scheduledAt TIMESTAMP(3) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 15,
    enrolledCount INTEGER NOT NULL DEFAULT 0,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT GymClass_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE PropertyListing (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    title TEXT NOT NULL,
    address TEXT,
    listingType TEXT NOT NULL DEFAULT 'SALE',
    status ListingStatus NOT NULL DEFAULT 'AVAILABLE',
    price DECIMAL(18,0) NOT NULL,
    areaSqm DOUBLE PRECISION,
    bedrooms INTEGER,
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT PropertyListing_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE PropertyShowing (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    listingId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    scheduledAt TIMESTAMP(3) NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT PropertyShowing_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE RepairJob (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    deviceLabel TEXT NOT NULL,
    issue TEXT NOT NULL,
    status RepairJobStatus NOT NULL DEFAULT 'INTAKE',
    quotedAmount DECIMAL(18,0),
    intakeAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    readyAt TIMESTAMP(3),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT RepairJob_pkey PRIMARY KEY (id)
);

-- CreateIndex
CREATE INDEX BeautyAppointment_organizationId_idx ON BeautyAppointment(organizationId);

-- CreateIndex
CREATE INDEX BeautyAppointment_organizationId_scheduledAt_idx ON BeautyAppointment(organizationId, scheduledAt);

-- CreateIndex
CREATE INDEX BeautyAppointment_customerId_idx ON BeautyAppointment(customerId);

-- CreateIndex
CREATE INDEX MenuItem_organizationId_idx ON MenuItem(organizationId);

-- CreateIndex
CREATE INDEX FoodOrder_organizationId_idx ON FoodOrder(organizationId);

-- CreateIndex
CREATE INDEX FoodOrder_organizationId_status_idx ON FoodOrder(organizationId, status);

-- CreateIndex
CREATE INDEX Course_organizationId_idx ON Course(organizationId);

-- CreateIndex
CREATE UNIQUE INDEX CourseEnrollment_courseId_customerId_key ON CourseEnrollment(courseId, customerId);

-- CreateIndex
CREATE INDEX CourseEnrollment_organizationId_idx ON CourseEnrollment(organizationId);

-- CreateIndex
CREATE INDEX GymMembership_organizationId_idx ON GymMembership(organizationId);

-- CreateIndex
CREATE INDEX GymMembership_organizationId_status_idx ON GymMembership(organizationId, status);

-- CreateIndex
CREATE INDEX GymMembership_customerId_idx ON GymMembership(customerId);

-- CreateIndex
CREATE INDEX GymClass_organizationId_idx ON GymClass(organizationId);

-- CreateIndex
CREATE INDEX GymClass_organizationId_scheduledAt_idx ON GymClass(organizationId, scheduledAt);

-- CreateIndex
CREATE INDEX PropertyListing_organizationId_idx ON PropertyListing(organizationId);

-- CreateIndex
CREATE INDEX PropertyListing_organizationId_status_idx ON PropertyListing(organizationId, status);

-- CreateIndex
CREATE INDEX PropertyShowing_organizationId_idx ON PropertyShowing(organizationId);

-- CreateIndex
CREATE INDEX PropertyShowing_listingId_idx ON PropertyShowing(listingId);

-- CreateIndex
CREATE INDEX RepairJob_organizationId_idx ON RepairJob(organizationId);

-- CreateIndex
CREATE INDEX RepairJob_organizationId_status_idx ON RepairJob(organizationId, status);

-- CreateIndex
CREATE INDEX RepairJob_customerId_idx ON RepairJob(customerId);

-- AddForeignKey
ALTER TABLE BeautyAppointment ADD CONSTRAINT BeautyAppointment_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE BeautyAppointment ADD CONSTRAINT BeautyAppointment_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE MenuItem ADD CONSTRAINT MenuItem_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE FoodOrder ADD CONSTRAINT FoodOrder_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE FoodOrder ADD CONSTRAINT FoodOrder_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE Course ADD CONSTRAINT Course_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE CourseEnrollment ADD CONSTRAINT CourseEnrollment_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE CourseEnrollment ADD CONSTRAINT CourseEnrollment_courseId_fkey FOREIGN KEY (courseId) REFERENCES Course(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE CourseEnrollment ADD CONSTRAINT CourseEnrollment_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE GymMembership ADD CONSTRAINT GymMembership_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE GymMembership ADD CONSTRAINT GymMembership_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE GymClass ADD CONSTRAINT GymClass_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE PropertyListing ADD CONSTRAINT PropertyListing_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE PropertyShowing ADD CONSTRAINT PropertyShowing_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE PropertyShowing ADD CONSTRAINT PropertyShowing_listingId_fkey FOREIGN KEY (listingId) REFERENCES PropertyListing(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE PropertyShowing ADD CONSTRAINT PropertyShowing_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE RepairJob ADD CONSTRAINT RepairJob_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE RepairJob ADD CONSTRAINT RepairJob_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;
