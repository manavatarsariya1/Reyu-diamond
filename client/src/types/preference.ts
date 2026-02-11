export enum DiamondShape {
    ROUND = 'Round',
    PRINCESS = 'Princess',
    EMERALD = 'Emerald',
    ASSCHER = 'Asscher',
    MARQUISE = 'Marquise',
    OVAL = 'Oval',
    RADIANT = 'Radiant',
    PEAR = 'Pear',
    HEART = 'Heart',
    CUSHION = 'Cushion',
}

export enum DiamondColor {
    D = 'D',
    E = 'E',
    F = 'F',
    G = 'G',
    H = 'H',
    I = 'I',
    J = 'J',
    K = 'K',
    L = 'L',
    M = 'M',
    N = 'N',
    O = 'O',
    P = 'P',
    Q = 'Q',
    R = 'R',
    S = 'S',
    T = 'T',
    U = 'U',
    V = 'V',
    W = 'W',
    X = 'X',
    Y = 'Y',
    Z = 'Z',
}

export enum DiamondClarity {
    FL = 'FL',
    IF = 'IF',
    VVS1 = 'VVS1',
    VVS2 = 'VVS2',
    VS1 = 'VS1',
    VS2 = 'VS2',
    SI1 = 'SI1',
    SI2 = 'SI2',
    I1 = 'I1',
    I2 = 'I2',
    I3 = 'I3',
}

export enum DiamondCertification {
    GIA = 'GIA',
    IGI = 'IGI',
    AGS = 'AGS',
    HRD = 'HRD',
    EGL = 'EGL',
}

export interface DiamondPreference {
    id: string;
    name: string; // User-friendly name for the preference
    shapes: DiamondShape[];
    minCarat: number;
    maxCarat: number;
    colors: DiamondColor[];
    clarities: DiamondClarity[];
    certifications: DiamondCertification[];
    minBudget: number;
    maxBudget: number;
    createdAt: string; // ISO String
}
