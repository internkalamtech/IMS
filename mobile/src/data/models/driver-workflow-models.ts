import {
    DriverProfile,
    RouteStop,
    StopStatus,
    StudentInfo,
    TripRoute,
    TripSession,
} from '@/domain/entities/driver-workflow';

export class DriverProfileModel {
    constructor(
        public id: string,
        public name: string,
        public busNumber: string,
        public busId: string,
    ) {}

    static fromJson(json: any): DriverProfileModel {
        return new DriverProfileModel(
            String(json.id),
            String(json.name),
            String(json.busNumber),
            String(json.busId),
        );
    }

    toJson() {
        return {
            id: this.id,
            name: this.name,
            busNumber: this.busNumber,
            busId: this.busId,
        };
    }

    toEntity(): DriverProfile {
        return this.toJson();
    }
}

export class RouteStopModel {
    constructor(
        public stopId: string,
        public stopName: string,
        public studentCount: number,
        public scheduledTime: string,
        public status: StopStatus,
    ) {}

    static fromJson(json: any): RouteStopModel {
        return new RouteStopModel(
            String(json.stopId),
            String(json.stopName),
            Number(json.studentCount),
            String(json.scheduledTime),
            json.status as StopStatus,
        );
    }

    toJson() {
        return {
            stopId: this.stopId,
            stopName: this.stopName,
            studentCount: this.studentCount,
            scheduledTime: this.scheduledTime,
            status: this.status,
        };
    }

    toEntity(): RouteStop {
        return this.toJson();
    }
}

export class TripRouteModel {
    constructor(
        public routeId: string,
        public routeName: string,
        public stops: RouteStopModel[],
    ) {}

    static fromJson(json: any): TripRouteModel {
        return new TripRouteModel(
            String(json.routeId),
            String(json.routeName),
            Array.isArray(json.stops) ? json.stops.map((stop: any) => RouteStopModel.fromJson(stop)) : [],
        );
    }

    toJson() {
        return {
            routeId: this.routeId,
            routeName: this.routeName,
            stops: this.stops.map((stop) => stop.toJson()),
        };
    }

    toEntity(): TripRoute {
        return {
            routeId: this.routeId,
            routeName: this.routeName,
            stops: this.stops.map((stop) => stop.toEntity()),
        };
    }
}

export class StudentInfoModel {
    constructor(
        public studentId: string,
        public name: string,
        public className: string,
        public rollNumber: string,
        public parentName: string,
        public parentPhone: string,
    ) {}

    static fromJson(json: any): StudentInfoModel {
        return new StudentInfoModel(
            String(json.studentId),
            String(json.name),
            String(json.className),
            String(json.rollNumber),
            String(json.parentName),
            String(json.parentPhone),
        );
    }

    toJson() {
        return {
            studentId: this.studentId,
            name: this.name,
            className: this.className,
            rollNumber: this.rollNumber,
            parentName: this.parentName,
            parentPhone: this.parentPhone,
        };
    }

    toEntity(): StudentInfo {
        return this.toJson();
    }
}

export class TripSessionModel {
    constructor(
        public tripId: string,
        public driverId: string,
        public routeId: string,
        public studentsBoarded: number,
        public totalStudents: number,
        public completedStops: number,
        public totalStops: number,
        public isActive: boolean,
    ) {}

    static fromJson(json: any): TripSessionModel {
        return new TripSessionModel(
            String(json.tripId),
            String(json.driverId),
            String(json.routeId),
            Number(json.studentsBoarded),
            Number(json.totalStudents),
            Number(json.completedStops),
            Number(json.totalStops),
            Boolean(json.isActive),
        );
    }

    toJson() {
        return {
            tripId: this.tripId,
            driverId: this.driverId,
            routeId: this.routeId,
            studentsBoarded: this.studentsBoarded,
            totalStudents: this.totalStudents,
            completedStops: this.completedStops,
            totalStops: this.totalStops,
            isActive: this.isActive,
        };
    }

    toEntity(): TripSession {
        return this.toJson();
    }
}
