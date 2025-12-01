export interface RakutenImageUrl {
  imageUrl: string;
}

export interface RakutenProduct {
  itemName: string;
  itemPrice: number;
  itemUrl: string;
  itemCode: string;
  mediumImageUrls: RakutenImageUrl[]; // 追加：楽天APIの画像配列
  imageUrl: string; // フロント用に1つの画像URL
  shopName: string;
  shopUrl: string;
  affiliateUrl: string;
  reviewCount: number;
  reviewAverage: number;
  itemCaption: string;
  availability: number;
  taxFlag: number;
  postageFlag: number;
  creditCardFlag: number;
  shopOfTheYearFlag: number;
  shipOverseasFlag: number;
  shipOverseasArea: string;
  asurakuFlag: number;
  asurakuClosingTime: string;
  asurakuArea: string;
  affiliateRate: number;
  startTime: string;
  endTime: string;
  rank: number;
}

export interface RakutenAPIResponse {
  Items: {
    Item: RakutenProduct;
  }[];
  pageCount: number;
  first: number;
  last: number;
  hits: number;
  carrier: number;
  page: number;
}

export interface RakutenSearchParams {
  keyword: string;
  applicationId: string;
  affiliateId?: string;
  hits?: number;
  page?: number;
  sort?: string;
}
